interface IsSafe {
  (input: string[] | Array<string|number>): boolean;
}

const isSafe: IsSafe = (input) => {
  if (!Array.isArray(input)) return false;

  const pattern =
    /\b(SELECT|INSERT|DELETE|UPDATE|DROP|UNION|ALTER|CREATE|;|--|#|\/\*)\b/i;

  const combined = input.map(i => String(i)).join(" ");

  return !pattern.test(combined);
};
export default isSafe;