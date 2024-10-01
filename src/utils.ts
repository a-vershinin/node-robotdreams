export const sum = (a: number, b: number) => {
  return a + b;
};

export const double = (value: number, count: number = 2): Promise<number> => {
  return new Promise((resolve) => {
    return resolve(value * count);
  });
};
