export const sum = (a: number, b: number) => {
  return a + b;
};

export const checkNumberIsPalindrome = (value: number): boolean => {
  const str = value.toString();
  const reverstedStr = str.split("").reverse().join("");
  return str === reverstedStr;
};
