export default { //to do: make this deterministic
  n: 1,
  next() {
    this.n++;
    return (1.0 / this.n);
  },
};

export const randint = (n: number) => Math.floor(Math.random() * n);
export const choice = (arr: any[]) => arr[randint(arr.length)];
