export const sum = (a: number, b: number) => {
  return a + b;
};

export const delay = (ms: number = 500): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      return resolve("success");
    }, ms);
  });
};
