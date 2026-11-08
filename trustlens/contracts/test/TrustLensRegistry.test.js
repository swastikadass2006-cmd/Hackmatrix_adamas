import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("TrustLensRegistry Contract Tests", function () {
  let registry;
  let owner;
  let reporter2;

  // Sample hash from our shared test vector
  const SAMPLE_HASH = "0xc04031a7ae4138079beefb150468f6d2c17059f775561ebc4a8edfc3227dff10";
  const SECOND_HASH = "0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658";
  const ZERO_HASH = "0x0000000000000000000000000000000000000000000000000000000000000000";

  beforeEach(async function () {
    [owner, reporter2] = await ethers.getSigners();
    const TrustLensRegistry = await ethers.getContractFactory("TrustLensRegistry");
    registry = await TrustLensRegistry.deploy();
    await registry.waitForDeployment();
  });

  it("registers a report successfully and emits ReportRegistered event", async function () {
    const tx = await registry.registerReport(SAMPLE_HASH, 1); // 1 = UrlScan
    await tx.wait();

    // Verify state
    const report = await registry.getReport(SAMPLE_HASH);
    expect(report.exists).to.be.true;
    expect(report.reporter).to.equal(owner.address);
    expect(report.reportType).to.equal(1n);
    expect(report.timestamp).to.be.greaterThan(0);

    const isReg = await registry.isRegistered(SAMPLE_HASH);
    expect(isReg).to.be.true;

    const total = await registry.totalReports();
    expect(total).to.equal(1n);

    // Verify event
    await expect(tx)
      .to.emit(registry, "ReportRegistered")
      .withArgs(SAMPLE_HASH, owner.address, report.timestamp, 1);
  });

  it("rejects duplicate report registrations to preserve original timestamp", async function () {
    await registry.registerReport(SAMPLE_HASH, 1);

    // Attempt to register again from another address
    await expect(
      registry.connect(reporter2).registerReport(SAMPLE_HASH, 2)
    ).to.be.revertedWith("TrustLens: Report hash already registered");
  });

  it("returns exists=false for unknown hashes", async function () {
    const report = await registry.getReport(SECOND_HASH);
    expect(report.exists).to.be.false;
    expect(report.reporter).to.equal(ethers.ZeroAddress);
    expect(report.timestamp).to.equal(0n);

    const isReg = await registry.isRegistered(SECOND_HASH);
    expect(isReg).to.be.false;
  });

  it("rejects invalid zero hash and unknown report type", async function () {
    await expect(
      registry.registerReport(ZERO_HASH, 1)
    ).to.be.revertedWith("TrustLens: Invalid zero hash");

    await expect(
      registry.registerReport(SAMPLE_HASH, 0)
    ).to.be.revertedWith("TrustLens: Invalid report type");
  });

  it("handles multiple distinct report registrations correctly", async function () {
    await registry.connect(owner).registerReport(SAMPLE_HASH, 1);
    await registry.connect(reporter2).registerReport(SECOND_HASH, 2);

    const total = await registry.totalReports();
    expect(total).to.equal(2n);

    const rep1 = await registry.getReport(SAMPLE_HASH);
    expect(rep1.reporter).to.equal(owner.address);

    const rep2 = await registry.getReport(SECOND_HASH);
    expect(rep2.reporter).to.equal(reporter2.address);
  });
});
