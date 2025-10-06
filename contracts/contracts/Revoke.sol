// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title RevocationModule
/// @notice Minimal module to revoke ERC20/ERC721/ERC1155 approvals/operators for a Smart Account or its agents.
contract RevocationModule {
    address public owner;
    mapping(address => bool) public agent;

    event OwnerTransferred(address indexed previousOwner, address indexed newOwner);
    event AgentUpdated(address indexed agentAddress, bool enabled);
    event ERC20Revoked(address indexed token, address indexed spender, bool success, bytes returnData);
    event ERC721ApprovalRevoked(address indexed token, uint256 indexed tokenId, bool success, bytes returnData);
    event OperatorRevoked(address indexed token, address indexed operator, bool success, bytes returnData);

    modifier onlyOwnerOrAgent() {
        require(msg.sender == owner || agent[msg.sender], "RevocationModule: unauthorized");
        _;
    }

    constructor(address _owner) {
        require(_owner != address(0), "RevocationModule: owner zero");
        owner = _owner;
    }

    function transferOwnership(address newOwner) external {
        require(msg.sender == owner, "RevocationModule: only owner");
        require(newOwner != address(0), "RevocationModule: new owner zero");
        address prev = owner;
        owner = newOwner;
        emit OwnerTransferred(prev, newOwner);
    }

    function setAgent(address _agent, bool _enabled) external {
        require(msg.sender == owner, "RevocationModule: only owner");
        agent[_agent] = _enabled;
        emit AgentUpdated(_agent, _enabled);
    }

    // Revoke ERC20 approval by setting allowance to zero
    function revokeERC20(address token, address spender) external onlyOwnerOrAgent {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSelector(bytes4(keccak256("approve(address,uint256)")), spender, uint256(0))
        );
        emit ERC20Revoked(token, spender, ok && (data.length == 0 || abi.decode(data, (bool))), data);
    }

    // Batch revoke ERC20 approvals
    function batchRevokeERC20(address[] calldata tokens, address[] calldata spenders) external onlyOwnerOrAgent {
        require(tokens.length == spenders.length, "RevocationModule: len mismatch");
        for (uint i = 0; i < tokens.length; i++) {
            (bool ok, bytes memory data) = tokens[i].call(
                abi.encodeWithSelector(bytes4(keccak256("approve(address,uint256)")), spenders[i], uint256(0))
            );
            emit ERC20Revoked(tokens[i], spenders[i], ok && (data.length == 0 || abi.decode(data, (bool))), data);
        }
    }

    // Revoke single ERC721 token approval
    function revokeERC721Approval(address token, uint256 tokenId) external onlyOwnerOrAgent {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSignature("approve(address,uint256)", address(0), tokenId)
        );
        emit ERC721ApprovalRevoked(token, tokenId, ok, data);
    }

    // Revoke ERC721 operator approval
    function revokeERC721Operator(address token, address operator) external onlyOwnerOrAgent {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSignature("setApprovalForAll(address,bool)", operator, false)
        );
        emit OperatorRevoked(token, operator, ok, data);
    }

    // Revoke ERC1155 operator approval
    function revokeERC1155Operator(address token, address operator) external onlyOwnerOrAgent {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSignature("setApprovalForAll(address,bool)", operator, false)
        );
        emit OperatorRevoked(token, operator, ok, data);
    }

    // Allow contract to receive ETH if needed (usually unused)
    receive() external payable {}
}
