// Utils
import { sum, findNumInRange, checkNumberIsPalindrome, double } from "./utils";

main();

function main() {
  console.log("🚀 node-robotdreams app ready");

  console.log("sum(10, 20) -> ", sum(10, 20));

  console.log("checkNumberIsPalindrome(212) -> ", checkNumberIsPalindrome(212));
  console.log("checkNumberIsPalindrome(321) -> ", checkNumberIsPalindrome(321));
  console.log("findNumInRange(30)", findNumInRange(30));

  const addTen = (v: number, target: number = 10): number => v + target;
  const value = 5;
  double(value)
    .then(addTen)
    .then((result) => {
      console.log(result); // 20
    });
}
