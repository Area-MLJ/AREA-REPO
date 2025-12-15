export function getClothingAdvice(temp: number): string {
    if (temp < 0) return "Grosse doudoune obligatoire ❄️";
    if (temp < 8) return "Manteau chaud recommandé 🧥";
    if (temp < 15) return "Un pull suffira 🙂";
    if (temp < 22) return "Tenue légère parfaite 👕";
    return "Très chaud, sortez léger ☀️";
  }
  