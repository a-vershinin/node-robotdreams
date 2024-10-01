// Utils
import { sum, double } from "./utils";

main();

function main() {
  console.log("🚀 node-robotdreams app ready");

  console.log("sum(10, 20) -> ", sum(10, 20));

  const addTen = (v: number, target: number = 10): number => v + target;

  const value = 5;
  double(value)
    .then(addTen)
    .then((result) => {
      console.log(result); // 20
    });
}
