import "./bootstrap";
import { backupScripts } from "./variables";
import "./observer";
import "./monkey";
import { unblock } from "./unblock";
import "./gcm";

window.PandectesRules.manualBlacklist = {
  1: [],
  2: [],
  4: [],
};

window.PandectesRules.unblock = unblock;

window.PandectesRules.getBackupScripts = function () {
  const output = [];
  for (let i = 0; i < backupScripts.blacklisted.length; i += 1) {
    output.push(backupScripts.blacklisted[i][0].getAttribute("src"));
  }
  return output;
};
