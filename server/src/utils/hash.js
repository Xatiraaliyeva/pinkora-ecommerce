import bcrypt from "bcrypt";

export const hashValue = async (v) => bcrypt.hash(v, 10);
export const compareValue = async (v, hash) => bcrypt.compare(v, hash);