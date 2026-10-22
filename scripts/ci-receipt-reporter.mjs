import {writeFileSync} from 'node:fs';
import path from 'node:path';
// Used both by --list (candidate inventory) and by actual shard execution.
export default class ReceiptReporter {
  tests = [];
  results = [];
  onBegin(config, suite) {
    this.tests = suite.allTests().map(test => ({id: test.id,
      file: path.relative(process.cwd(),test.location.file).replaceAll('\\','/'),
      title: test.titlePath(), repeatEachIndex: test.repeatEachIndex, browser: test.parent.project().name, expectedStatus: test.expectedStatus}));
  }
  onTestEnd(test, result) {
    this.results.push({id:test.id, status:result.status, expectedStatus:test.expectedStatus,
      retry:result.retry, duration:result.duration});
  }
  onEnd(result) {
    writeFileSync(process.env.CI_RECEIPT_OUTPUT, JSON.stringify({tests:this.tests,results:this.results,status:result.status},null,2)+'\n');
  }
}
