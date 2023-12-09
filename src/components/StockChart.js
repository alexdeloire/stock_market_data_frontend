import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import axios from 'axios';
import Select from 'react-select';
import CorrelationMatrixTable from './CorrelationMatrixTable';
import { calculateCorrelationMatrix, getRandomColor } from '../utils/utils';


// Just in case the backend shuts down and the request times out
const stockDataSamp = {
    dates: ['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04', '2023-01-05'],
    companyA: [100, 105, 50, 35, 30],
    companyB: [50, 48, 55, 60, 58],
    companyC: [75, 80, 82, 78, 85],
};

const stockOptionsSamp = Object.keys(stockDataSamp)
    .filter(key => key !== 'dates') // Exclude the 'dates' key
    .map(company => ({
        value: company,
        label: company,
    }));


const StockChart = () => {
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [showDifferenceChart, setShowDifferenceChart] = useState(false);
    const [correlationMatrix, setCorrelationMatrix] = useState(null);
    const [stockData, setStockData] = useState({});
    const [stockOptions, setStockOptions] = useState([]);
    const [file, setFile] = useState(null);
    const [uploadComplete, setUploadComplete] = useState(false);

    // Get stockData from API
    useEffect(() => {
        const fetchStockData = async () => {
            try {
                const response = await axios.get('https://stock-market-data-backend.onrender.com/api/stock_prices/');

                if (response.status === 200) {
                    setStockData(response.data);
                    setStockOptions(Object.keys(response.data)
                        .filter(key => key !== 'dates') // Exclude the 'dates' key
                        .map(company => ({
                            value: company,
                            label: company,
                        })));
                }
                else{
                    setStockData(stockDataSamp);
                    setStockOptions(stockOptionsSamp);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        setSelectedCompanies([]);
        setShowDifferenceChart(false);
        setCorrelationMatrix(null);
        setStockData({});
        setStockOptions([]);
        fetchStockData();

    }, [uploadComplete]);

    const handleCompanySelection = selectedOptions => {
        setSelectedCompanies(selectedOptions);
        setShowDifferenceChart(selectedOptions.length === 2);
        if (selectedOptions.length > 2) {
            // Calculate correlation matrix when 3 or more companies are selected
            const selectedData = selectedOptions.map(option => stockData[option.value]);
            const matrix = calculateCorrelationMatrix(selectedData);

            // Round the values to 2 decimal places
            for (let i = 0; i < matrix.length; i++) {
                for (let j = 0; j < matrix[i].length; j++) {
                    matrix[i][j] = Math.round(matrix[i][j] * 100) / 100;
                }
            }

            setCorrelationMatrix(matrix);
        } else {
            // Reset correlation matrix if less than 3 companies are selected
            setCorrelationMatrix(null);
        }
    };

    const getChartData = () => {
        const labels = stockData.dates;

        const datasets = Object.keys(stockData)
            .filter(key => key !== 'dates') // Exclude the 'dates' key
            .map((company, index) => ({
                label: `${company}`,
                data: stockData[company],
                borderColor: getRandomColor(),
                fill: false,
            }));

        return {
            labels: labels,
            datasets: datasets,
        };

    };

    const getDifferenceChartData = () => {
        if (selectedCompanies.length !== 2) {
            // Return an empty dataset if not exactly two companies are selected
            return {
                labels: [],
                datasets: [],
            };
        }

        const [companyA, companyB] = selectedCompanies;

        const labels = stockData.dates;

        const differenceData = stockData.dates.map((date, index) => ({
            x: date,
            y: stockData[companyA.value][index] - stockData[companyB.value][index],
        }));

        const differenceDataset = {
            label: `Price Difference: ${companyA.label} - ${companyB.label}`,
            data: differenceData,
            borderColor: getRandomColor(),
            fill: false,
        };

        return {
            labels: labels,
            datasets: [differenceDataset],
        };
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            // Check that the file name is the same as the one we are expecting
            if (!(file.name == 'stock_3_companies.csv' || file.name == 'stock_4_companies.csv')) {
                alert('Please upload a file provided by us');
                setFile(null);
                return;
            }

            const response = await axios.post('https://stock-market-data-backend.onrender.com/api/stock_prices/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                setUploadComplete(!uploadComplete);
            }
        } catch (error) {
            console.error('Error uploading file', error);
        }
    };


    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '2000px' }}>
            <p style={{ paddingBottom: '20px' }}>Historic stock market prices for different companies:</p>

            <div className='line-chart'>
                <Line
                    data={getChartData()}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                labels: {
                                    color: 'black', // Set the text color
                                },
                            },
                        },
                    }}
                />
            </div>


            <p style={{ margin: '10px', paddingBottom: '15px', textAlign: 'center' }}>Select companies to compare, if you select two companies, a line chart showing the difference will pop up and if you select 3 or more, a correlation matrix will pop up:</p>

            <div className="select-companies">
                <Select
                    isMulti
                    options={stockOptions}
                    onChange={handleCompanySelection}
                    value={selectedCompanies}
                />
            </div>

            {showDifferenceChart &&
                <div className='line-chart'>
                    <Line data={getDifferenceChartData()} options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                labels: {
                                    color: 'black', // Set the text color
                                },
                            },
                        },
                    }} />
                </div>}

            {correlationMatrix && (
                <div className='correlation-matrix'>
                    <CorrelationMatrixTable matrix={correlationMatrix} companyNames={selectedCompanies.map(company => company.label)} />
                </div>
            )}

            <p style={{ margin: '10px', paddingBottom: '15px', textAlign: 'center', fontSize: '40px' }}>Import new data:</p>
            <div>
                <input type="file" accept=".csv" onChange={handleFileChange} />
                <button onClick={handleUpload} disabled={!file}>
                    Upload CSV
                </button>
            </div>
        </div>
    );

};
export default StockChart;
