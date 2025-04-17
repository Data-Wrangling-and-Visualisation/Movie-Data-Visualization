import { corr } from 'mathjs';

export function computeCorrelationMatrix(data) {
  const keys = Object.keys(data[0]);
  const matrix = [];

  for (let i = 0; i < keys.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < keys.length; j++) {
      const x = data.map(item => item[keys[i]]);
      const y = data.map(item => item[keys[j]]);
      matrix[i][j] = corr(x, y);
    }
  }

  return { keys, matrix };
}
  
