
const cosineSimilarity = (vectorA, vectorB) => {
    // Calculate the dot product of vectorA and vectorB
    const dotProduct = vectorA.reduce((acc, val, index) => acc + val * vectorB[index], 0);

    // Calculate the magnitude (Euclidean norm) of vectorA and vectorB
    const magnitudeA = Math.sqrt(vectorA.reduce((acc, val) => acc + val ** 2, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((acc, val) => acc + val ** 2, 0));

    // Calculate the cosine similarity
    const similarity = dotProduct / (magnitudeA * magnitudeB);

    return similarity;
};

const calculateCorrelationMatrix = (data) => {
    const companies = Object.keys(data);
    const matrix = [];

    for (let i = 0; i < companies.length; i++) {
        const row = [];
        for (let j = 0; j < companies.length; j++) {
            const similarity = cosineSimilarity(data[companies[i]], data[companies[j]]);
            row.push(similarity);
        }
        matrix.push(row);
    }

    return matrix;
};

const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';

    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }

    return color;
};

export { calculateCorrelationMatrix, getRandomColor };