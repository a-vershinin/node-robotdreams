// Utils
import { sum, findNumInRange, checkNumberIsPalindrome, delay } from "./utils";

main();

function main() {
  console.log("🚀 node-robotdreams app ready");

  console.log("sum(10, 20) -> ", sum(10, 20));

  console.log("checkNumberIsPalindrome(212) -> ", checkNumberIsPalindrome(212));
  console.log("checkNumberIsPalindrome(321) -> ", checkNumberIsPalindrome(321));
  console.log("findNumInRange(30)", findNumInRange(30));
  delay(2000).then(() => console.log("Прошло 2 секунди"));
}
