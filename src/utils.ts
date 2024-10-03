export const sum = (a: number, b: number) => {
  return a + b;
};

export const findNumInRange = (value: number): number[] => {
  const TARGET_RANGE = [3, 5, 7];
  const getRange = (size: number, startAt = 1): number[] => {
    return [...Array(size).keys()].map((i) => i + startAt);
  };
  const currentRange = getRange(value, 1);

  const isDivideByTarget = (num: number, rangeNum: number[] = []): boolean => {
    return rangeNum.some((rValue) => num % rValue === 0);
  };

  return currentRange.reduce<number[]>((acc, item) => {
    if (isDivideByTarget(item, TARGET_RANGE)) {
      return [...acc, item];
    }
    return acc;
  }, []);
};
export const checkNumberIsPalindrome = (value: number): boolean => {
  const str = value.toString();
  const reverstedStr = str.split("").reverse().join("");
  return str === reverstedStr;
};
export const double = (value: number, count: number = 2): Promise<number> => {
  return new Promise((resolve) => {
    return resolve(value * count);
  });
};
