module ContractType = {
  @genType
  type t = 
    | @as("ERC20") ERC20

  let name = "CONTRACT_TYPE"
  let variants = [
    ERC20,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

module EntityType = {
  @genType
  type t = 
    | @as("Approval") Approval
    | @as("dynamic_contract_registry") DynamicContractRegistry

  let name = "ENTITY_TYPE"
  let variants = [
    Approval,
    DynamicContractRegistry,
  ]
  let config = Internal.makeEnumConfig(~name, ~variants)
}

let allEnums = ([
  ContractType.config->Internal.fromGenericEnumConfig,
  EntityType.config->Internal.fromGenericEnumConfig,
])
