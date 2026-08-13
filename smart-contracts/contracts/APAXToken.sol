// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title APX Gold
/// @notice Permissioned gold token: one token represents one gram of vaulted gold.
/// @dev A pragmatic ERC-20 hybrid. Identity remains off-chain while an on-chain
///      allowlist gates movement. Production deployments should put admin roles
///      behind separate multisigs/timelocks and mint only after deposit attestation.
contract APAXToken is ERC20, AccessControl, Pausable {
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    mapping(address => bool) private approvedHolders;

    error InvalidHolderAddress();
    error HolderAlreadyApproved(address holder);
    error HolderNotApproved(address holder);
    error HolderNotAllowed(address holder);

    event HolderApproved(address indexed holder);
    event HolderRevoked(address indexed holder);
    event VaultDepositMinted(address indexed to, uint256 amount, bytes32 indexed depositId);
    event RedemptionBurned(address indexed from, uint256 amount, bytes32 indexed redemptionId);

    constructor(address admin) ERC20("APX Gold", "APXG") {
        if (admin == address(0)) revert InvalidHolderAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(COMPLIANCE_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
        _grantRole(BURNER_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        approvedHolders[admin] = true;
        emit HolderApproved(admin);
    }

    function approveHolder(address holder) external onlyRole(COMPLIANCE_ROLE) {
        if (holder == address(0)) revert InvalidHolderAddress();
        if (approvedHolders[holder]) revert HolderAlreadyApproved(holder);
        approvedHolders[holder] = true;
        emit HolderApproved(holder);
    }

    function revokeHolder(address holder) external onlyRole(COMPLIANCE_ROLE) {
        if (holder == address(0)) revert InvalidHolderAddress();
        if (!approvedHolders[holder]) revert HolderNotApproved(holder);
        approvedHolders[holder] = false;
        emit HolderRevoked(holder);
    }

    function isApproved(address holder) external view returns (bool) {
        return approvedHolders[holder];
    }

    function mintForDeposit(
        address to,
        uint256 amount,
        bytes32 depositId
    ) external onlyRole(MINTER_ROLE) whenNotPaused {
        _mint(to, amount);
        emit VaultDepositMinted(to, amount, depositId);
    }

    /// @notice Burns after the backend/redemption operator has locked and approved a request.
    function burnForRedemption(
        address from,
        uint256 amount,
        bytes32 redemptionId
    ) external onlyRole(BURNER_ROLE) whenNotPaused {
        _burn(from, amount);
        emit RedemptionBurned(from, amount, redemptionId);
    }

    function pause() external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        if (from != address(0) && !approvedHolders[from]) revert HolderNotAllowed(from);
        if (to != address(0) && !approvedHolders[to]) revert HolderNotAllowed(to);
        super._update(from, to, value);
    }
}
