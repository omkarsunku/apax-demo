import { expect } from "chai";
import { network } from "hardhat";

describe("APAXToken", function () {
  async function fixture() {
    const { ethers } = await network.connect();
    const [admin, holder, recipient, outsider] = await ethers.getSigners();
    const token = await ethers.deployContract("APAXToken", [admin.address]);
    await token.waitForDeployment();
    await token.approveHolder(holder.address);
    return { ethers, token, admin, holder, recipient, outsider };
  }

  it("starts with no unbacked supply", async function () {
    const { token } = await fixture();
    expect(await token.totalSupply()).to.equal(0n);
  });

  it("allows only the minter role to mint for an approved vault deposit", async function () {
    const { ethers, token, holder, outsider } = await fixture();
    const depositId = ethers.id("vault-deposit-1");
    await expect(token.mintForDeposit(holder.address, ethers.parseEther("10"), depositId))
      .to.emit(token, "VaultDepositMinted")
      .withArgs(holder.address, ethers.parseEther("10"), depositId);
    await expect(token.connect(outsider).mintForDeposit(holder.address, 1n, depositId))
      .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
  });

  it("blocks transfers to a non-whitelisted recipient", async function () {
    const { ethers, token, holder, recipient } = await fixture();
    await token.mintForDeposit(holder.address, ethers.parseEther("10"), ethers.id("deposit"));
    await expect(token.connect(holder).transfer(recipient.address, 1n))
      .to.be.revertedWithCustomError(token, "HolderNotAllowed")
      .withArgs(recipient.address);
  });

  it("allows compliant transfers after both parties are approved", async function () {
    const { ethers, token, holder, recipient } = await fixture();
    await token.approveHolder(recipient.address);
    await token.mintForDeposit(holder.address, 10n, ethers.id("deposit"));
    await token.connect(holder).transfer(recipient.address, 4n);
    expect(await token.balanceOf(recipient.address)).to.equal(4n);
  });

  it("allows only the burner role to burn an approved redemption", async function () {
    const { ethers, token, holder, outsider } = await fixture();
    const redemptionId = ethers.id("redemption-1");
    await token.mintForDeposit(holder.address, 10n, ethers.id("deposit"));
    await expect(token.burnForRedemption(holder.address, 4n, redemptionId))
      .to.emit(token, "RedemptionBurned").withArgs(holder.address, 4n, redemptionId);
    expect(await token.balanceOf(holder.address)).to.equal(6n);
    await expect(token.connect(outsider).burnForRedemption(holder.address, 1n, redemptionId))
      .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
  });

  it("stops mint, burn, and transfer while paused", async function () {
    const { ethers, token, holder } = await fixture();
    await token.mintForDeposit(holder.address, 10n, ethers.id("deposit"));
    await token.pause();
    await expect(token.mintForDeposit(holder.address, 1n, ethers.id("deposit-2")))
      .to.be.revertedWithCustomError(token, "EnforcedPause");
    await expect(token.burnForRedemption(holder.address, 1n, ethers.id("redemption")))
      .to.be.revertedWithCustomError(token, "EnforcedPause");
  });
});
