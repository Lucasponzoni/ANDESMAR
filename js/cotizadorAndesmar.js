const precios = [
    { ciudad: "buenos aires", metrosCubicos: 0.02, precio: 5933.12 },
    { ciudad: "buenos aires", metrosCubicos: 0.04, precio: 6943.74 },
    { ciudad: "buenos aires", metrosCubicos: 0.08, precio: 9109.36 },
    { ciudad: "buenos aires", metrosCubicos: 0.1, precio: 10058.11 },
    { ciudad: "buenos aires", metrosCubicos: 0.2, precio: 12058.73 },
    { ciudad: "buenos aires", metrosCubicos: 0.3, precio: 15083.73 },
    { ciudad: "buenos aires", metrosCubicos: 0.4, precio: 20095.60 },
    { ciudad: "buenos aires", metrosCubicos: 0.5, precio: 26262.46 },
    { ciudad: "buenos aires", metrosCubicos: 0.6, precio: 31501.20 },
    { ciudad: "buenos aires", metrosCubicos: 0.7, precio: 36760.57 },
    { ciudad: "buenos aires", metrosCubicos: 0.8, precio: 41999.31 },
    { ciudad: "buenos aires", metrosCubicos: 0.9, precio: 47265.56 },
    { ciudad: "buenos aires", metrosCubicos: 1, precio: 52490.55 },
    { ciudad: "buenos aires", metrosCubicos: 1.2, precio: 57653.67 },
    { ciudad: "buenos aires", metrosCubicos: 1.4, precio: 62885.54 },
    { ciudad: "buenos aires", metrosCubicos: 1.6, precio: 68131.15 },
    { ciudad: "buenos aires", metrosCubicos: 1.8, precio: 73356.15 },
    { ciudad: "buenos aires", metrosCubicos: 2, precio: 78601.76 },
    { ciudad: "buenos aires", metrosCubicos: 0.25, precio: 9831.24 },

    { ciudad: "capital federal", metrosCubicos: 0.02, precio: 5933.12 },
    { ciudad: "capital federal", metrosCubicos: 0.04, precio: 6943.74 },
    { ciudad: "capital federal", metrosCubicos: 0.08, precio: 9109.36 },
    { ciudad: "capital federal", metrosCubicos: 0.1, precio: 10058.11 },
    { ciudad: "capital federal", metrosCubicos: 0.2, precio: 12058.73 },
    { ciudad: "capital federal", metrosCubicos: 0.3, precio: 15083.73 },
    { ciudad: "capital federal", metrosCubicos: 0.4, precio: 20095.60 },
    { ciudad: "capital federal", metrosCubicos: 0.5, precio: 26262.46 },
    { ciudad: "capital federal", metrosCubicos: 0.6, precio: 31501.20 },
    { ciudad: "capital federal", metrosCubicos: 0.7, precio: 36760.57 },
    { ciudad: "capital federal", metrosCubicos: 0.8, precio: 41999.31 },
    { ciudad: "capital federal", metrosCubicos: 0.9, precio: 47265.56 },
    { ciudad: "capital federal", metrosCubicos: 1, precio: 52490.55 },
    { ciudad: "capital federal", metrosCubicos: 1.2, precio: 57653.67 },
    { ciudad: "capital federal", metrosCubicos: 1.4, precio: 62885.54 },
    { ciudad: "capital federal", metrosCubicos: 1.6, precio: 68131.15 },
    { ciudad: "capital federal", metrosCubicos: 1.8, precio: 73356.15 },
    { ciudad: "capital federal", metrosCubicos: 2, precio: 78601.76 },
    { ciudad: "capital federal", metrosCubicos: 0.25, precio: 9831.24 },

    { ciudad: "cordoba", metrosCubicos: 0.02, precio: 5933.12 },
    { ciudad: "cordoba", metrosCubicos: 0.04, precio: 6943.74 },
    { ciudad: "cordoba", metrosCubicos: 0.08, precio: 9109.36 },
    { ciudad: "cordoba", metrosCubicos: 0.1, precio: 10058.11 },
    { ciudad: "cordoba", metrosCubicos: 0.2, precio: 12058.73 },
    { ciudad: "cordoba", metrosCubicos: 0.3, precio: 15083.73 },
    { ciudad: "cordoba", metrosCubicos: 0.4, precio: 20095.60 },
    { ciudad: "cordoba", metrosCubicos: 0.5, precio: 26262.46 },
    { ciudad: "cordoba", metrosCubicos: 0.6, precio: 31501.20 },
    { ciudad: "cordoba", metrosCubicos: 0.7, precio: 36760.57 },
    { ciudad: "cordoba", metrosCubicos: 0.8, precio: 41999.31 },
    { ciudad: "cordoba", metrosCubicos: 0.9, precio: 47265.56 },
    { ciudad: "cordoba", metrosCubicos: 1, precio: 52490.55 },
    { ciudad: "cordoba", metrosCubicos: 1.2, precio: 57653.67 },
    { ciudad: "cordoba", metrosCubicos: 1.4, precio: 62885.54 },
    { ciudad: "cordoba", metrosCubicos: 1.6, precio: 68131.15 },
    { ciudad: "cordoba", metrosCubicos: 1.8, precio: 73356.15 },
    { ciudad: "cordoba", metrosCubicos: 2, precio: 78601.76 },
    { ciudad: "cordoba", metrosCubicos: 0.25, precio: 9831.24 },

    { ciudad: "mendoza", metrosCubicos: 0.02, precio: 7411.24 },
    { ciudad: "mendoza", metrosCubicos: 0.04, precio: 8669.36 },
    { ciudad: "mendoza", metrosCubicos: 0.08, precio: 11378.11 },
    { ciudad: "mendoza", metrosCubicos: 0.1, precio: 12553.73 },
    { ciudad: "mendoza", metrosCubicos: 0.2, precio: 15069.98 },
    { ciudad: "mendoza", metrosCubicos: 0.3, precio: 18844.35 },
    { ciudad: "mendoza", metrosCubicos: 0.4, precio: 25107.46 },
    { ciudad: "mendoza", metrosCubicos: 0.5, precio: 32828.08 },
    { ciudad: "mendoza", metrosCubicos: 0.6, precio: 39373.07 },
    { ciudad: "mendoza", metrosCubicos: 0.7, precio: 45945.56 },
    { ciudad: "mendoza", metrosCubicos: 0.8, precio: 52490.55 },
    { ciudad: "mendoza", metrosCubicos: 0.9, precio: 59069.92 },
    { ciudad: "mendoza", metrosCubicos: 1, precio: 65614.91 },
    { ciudad: "mendoza", metrosCubicos: 1.2, precio: 72056.77 },
    { ciudad: "mendoza", metrosCubicos: 1.4, precio: 78588.01 },
    { ciudad: "mendoza", metrosCubicos: 1.6, precio: 85153.63 },
    { ciudad: "mendoza", metrosCubicos: 1.8, precio: 91684.87 },
    { ciudad: "mendoza", metrosCubicos: 2, precio: 98250.48 },
    { ciudad: "mendoza", metrosCubicos: 0.25, precio: 12285.61 },

    { ciudad: "san juan", metrosCubicos: 0.02, precio: 7411.24 },
    { ciudad: "san juan", metrosCubicos: 0.04, precio: 8669.36 },
    { ciudad: "san juan", metrosCubicos: 0.08, precio: 11378.11 },
    { ciudad: "san juan", metrosCubicos: 0.1, precio: 12553.73 },
    { ciudad: "san juan", metrosCubicos: 0.2, precio: 15069.98 },
    { ciudad: "san juan", metrosCubicos: 0.3, precio: 18844.35 },
    { ciudad: "san juan", metrosCubicos: 0.4, precio: 25107.46 },
    { ciudad: "san juan", metrosCubicos: 0.5, precio: 32828.08 },
    { ciudad: "san juan", metrosCubicos: 0.6, precio: 39373.07 },
    { ciudad: "san juan", metrosCubicos: 0.7, precio: 45945.56 },
    { ciudad: "san juan", metrosCubicos: 0.8, precio: 52490.55 },
    { ciudad: "san juan", metrosCubicos: 0.9, precio: 59069.92 },
    { ciudad: "san juan", metrosCubicos: 1, precio: 65614.91 },
    { ciudad: "san juan", metrosCubicos: 1.2, precio: 72056.77 },
    { ciudad: "san juan", metrosCubicos: 1.4, precio: 78588.01 },
    { ciudad: "san juan", metrosCubicos: 1.6, precio: 85153.63 },
    { ciudad: "san juan", metrosCubicos: 1.8, precio: 91684.87 },
    { ciudad: "san juan", metrosCubicos: 2, precio: 98250.48 },
    { ciudad: "san juan", metrosCubicos: 0.25, precio: 12285.61 },

    { ciudad: "san luis", metrosCubicos: 0.02, precio: 7411.24 },
    { ciudad: "san luis", metrosCubicos: 0.04, precio: 8669.36 },
    { ciudad: "san luis", metrosCubicos: 0.08, precio: 11378.11 },
    { ciudad: "san luis", metrosCubicos: 0.1, precio: 12553.73 },
    { ciudad: "san luis", metrosCubicos: 0.2, precio: 15069.98 },
    { ciudad: "san luis", metrosCubicos: 0.3, precio: 18844.35 },
    { ciudad: "san luis", metrosCubicos: 0.4, precio: 25107.46 },
    { ciudad: "san luis", metrosCubicos: 0.5, precio: 32828.08 },
    { ciudad: "san luis", metrosCubicos: 0.6, precio: 39373.07 },
    { ciudad: "san luis", metrosCubicos: 0.7, precio: 45945.56 },
    { ciudad: "san luis", metrosCubicos: 0.8, precio: 52490.55 },
    { ciudad: "san luis", metrosCubicos: 0.9, precio: 59069.92 },
    { ciudad: "san luis", metrosCubicos: 1, precio: 65614.91 },
    { ciudad: "san luis", metrosCubicos: 1.2, precio: 72056.77 },
    { ciudad: "san luis", metrosCubicos: 1.4, precio: 78588.01 },
    { ciudad: "san luis", metrosCubicos: 1.6, precio: 85153.63 },
    { ciudad: "san luis", metrosCubicos: 1.8, precio: 91684.87 },
    { ciudad: "san luis", metrosCubicos: 2, precio: 98250.48 },
    { ciudad: "san luis", metrosCubicos: 0.25, precio: 12285.61 },

    { ciudad: "santiago del estero", metrosCubicos: 0.02, precio: 9467.71 },
    { ciudad: "santiago del estero", metrosCubicos: 0.04, precio: 11074.94 },
    { ciudad: "santiago del estero", metrosCubicos: 0.08, precio: 14535.31 },
    { ciudad: "santiago del estero", metrosCubicos: 0.1, precio: 16037.14 },
    { ciudad: "santiago del estero", metrosCubicos: 0.2, precio: 19251.60 },
    { ciudad: "santiago del estero", metrosCubicos: 0.3, precio: 24073.28 },
    { ciudad: "santiago del estero", metrosCubicos: 0.4, precio: 32074.29 },
    { ciudad: "santiago del estero", metrosCubicos: 0.5, precio: 41937.22 },
    { ciudad: "santiago del estero", metrosCubicos: 0.6, precio: 50298.31 },
    { ciudad: "santiago del estero", metrosCubicos: 0.7, precio: 58694.54 },
    { ciudad: "santiago del estero", metrosCubicos: 0.8, precio: 67055.64 },
    { ciudad: "santiago del estero", metrosCubicos: 0.9, precio: 75460.64 },
    { ciudad: "santiago del estero", metrosCubicos: 1, precio: 83821.74 },
    { ciudad: "santiago del estero", metrosCubicos: 1.2, precio: 92051.10 },
    { ciudad: "santiago del estero", metrosCubicos: 1.4, precio: 100394.63 },
    { ciudad: "santiago del estero", metrosCubicos: 1.6, precio: 108782.07 },
    { ciudad: "santiago del estero", metrosCubicos: 1.8, precio: 117125.60 },
    { ciudad: "santiago del estero", metrosCubicos: 2, precio: 125513.04 },
    { ciudad: "santiago del estero", metrosCubicos: 0.25, precio: 15694.62 },

    { ciudad: "salta", metrosCubicos: 0.02, precio: 9467.71 },
    { ciudad: "salta", metrosCubicos: 0.04, precio: 11074.94 },
    { ciudad: "salta", metrosCubicos: 0.08, precio: 14535.31 },
    { ciudad: "salta", metrosCubicos: 0.1, precio: 16037.14 },
    { ciudad: "salta", metrosCubicos: 0.2, precio: 19251.60 },
    { ciudad: "salta", metrosCubicos: 0.3, precio: 24073.28 },
    { ciudad: "salta", metrosCubicos: 0.4, precio: 32074.29 },
    { ciudad: "salta", metrosCubicos: 0.5, precio: 41937.22 },
    { ciudad: "salta", metrosCubicos: 0.6, precio: 50298.31 },
    { ciudad: "salta", metrosCubicos: 0.7, precio: 58694.54 },
    { ciudad: "salta", metrosCubicos: 0.8, precio: 67055.64 },
    { ciudad: "salta", metrosCubicos: 0.9, precio: 75460.64 },
    { ciudad: "salta", metrosCubicos: 1, precio: 83821.74 },
    { ciudad: "salta", metrosCubicos: 1.2, precio: 92051.10 },
    { ciudad: "salta", metrosCubicos: 1.4, precio: 100394.63 },
    { ciudad: "salta", metrosCubicos: 1.6, precio: 108782.07 },
    { ciudad: "salta", metrosCubicos: 1.8, precio: 117125.60 },
    { ciudad: "salta", metrosCubicos: 2, precio: 125513.04 },
    { ciudad: "salta", metrosCubicos: 0.25, precio: 15694.62 },

    { ciudad: "catamarca", metrosCubicos: 0.02, precio: 9467.71 },
    { ciudad: "catamarca", metrosCubicos: 0.04, precio: 11074.94 },
    { ciudad: "catamarca", metrosCubicos: 0.08, precio: 14535.31 },
    { ciudad: "catamarca", metrosCubicos: 0.1, precio: 16037.14 },
    { ciudad: "catamarca", metrosCubicos: 0.2, precio: 19251.60 },
    { ciudad: "catamarca", metrosCubicos: 0.3, precio: 24073.28 },
    { ciudad: "catamarca", metrosCubicos: 0.4, precio: 32074.29 },
    { ciudad: "catamarca", metrosCubicos: 0.5, precio: 41937.22 },
    { ciudad: "catamarca", metrosCubicos: 0.6, precio: 50298.31 },
    { ciudad: "catamarca", metrosCubicos: 0.7, precio: 58694.54 },
    { ciudad: "catamarca", metrosCubicos: 0.8, precio: 67055.64 },
    { ciudad: "catamarca", metrosCubicos: 0.9, precio: 75460.64 },
    { ciudad: "catamarca", metrosCubicos: 1, precio: 83821.74 },
    { ciudad: "catamarca", metrosCubicos: 1.2, precio: 92051.10 },
    { ciudad: "catamarca", metrosCubicos: 1.4, precio: 100394.63 },
    { ciudad: "catamarca", metrosCubicos: 1.6, precio: 108782.07 },
    { ciudad: "catamarca", metrosCubicos: 1.8, precio: 117125.60 },
    { ciudad: "catamarca", metrosCubicos: 2, precio: 125513.04 },
    { ciudad: "catamarca", metrosCubicos: 0.25, precio: 15694.62 },

    { ciudad: "la rioja", metrosCubicos: 0.02, precio: 9467.71 },
    { ciudad: "la rioja", metrosCubicos: 0.04, precio: 11074.94 },
    { ciudad: "la rioja", metrosCubicos: 0.08, precio: 14535.31 },
    { ciudad: "la rioja", metrosCubicos: 0.1, precio: 16037.14 },
    { ciudad: "la rioja", metrosCubicos: 0.2, precio: 19251.60 },
    { ciudad: "la rioja", metrosCubicos: 0.3, precio: 24073.28 },
    { ciudad: "la rioja", metrosCubicos: 0.4, precio: 32074.29 },
    { ciudad: "la rioja", metrosCubicos: 0.5, precio: 41937.22 },
    { ciudad: "la rioja", metrosCubicos: 0.6, precio: 50298.31 },
    { ciudad: "la rioja", metrosCubicos: 0.7, precio: 58694.54 },
    { ciudad: "la rioja", metrosCubicos: 0.8, precio: 67055.64 },
    { ciudad: "la rioja", metrosCubicos: 0.9, precio: 75460.64 },
    { ciudad: "la rioja", metrosCubicos: 1, precio: 83821.74 },
    { ciudad: "la rioja", metrosCubicos: 1.2, precio: 92051.10 },
    { ciudad: "la rioja", metrosCubicos: 1.4, precio: 100394.63 },
    { ciudad: "la rioja", metrosCubicos: 1.6, precio: 108782.07 },
    { ciudad: "la rioja", metrosCubicos: 1.8, precio: 117125.60 },
    { ciudad: "la rioja", metrosCubicos: 2, precio: 125513.04 },
    { ciudad: "la rioja", metrosCubicos: 0.25, precio: 15694.62 },

    { ciudad: "tucuman", metrosCubicos: 0.02, precio: 9467.71 },
    { ciudad: "tucuman", metrosCubicos: 0.04, precio: 11074.94 },
    { ciudad: "tucuman", metrosCubicos: 0.08, precio: 14535.31 },
    { ciudad: "tucuman", metrosCubicos: 0.1, precio: 16037.14 },
    { ciudad: "tucuman", metrosCubicos: 0.2, precio: 19251.60 },
    { ciudad: "tucuman", metrosCubicos: 0.3, precio: 24073.28 },
    { ciudad: "tucuman", metrosCubicos: 0.4, precio: 32074.29 },
    { ciudad: "tucuman", metrosCubicos: 0.5, precio: 41937.22 },
    { ciudad: "tucuman", metrosCubicos: 0.6, precio: 50298.31 },
    { ciudad: "tucuman", metrosCubicos: 0.7, precio: 58694.54 },
    { ciudad: "tucuman", metrosCubicos: 0.8, precio: 67055.64 },
    { ciudad: "tucuman", metrosCubicos: 0.9, precio: 75460.64 },
    { ciudad: "tucuman", metrosCubicos: 1, precio: 83821.74 },
    { ciudad: "tucuman", metrosCubicos: 1.2, precio: 92051.10 },
    { ciudad: "tucuman", metrosCubicos: 1.4, precio: 100394.63 },
    { ciudad: "tucuman", metrosCubicos: 1.6, precio: 108782.07 },
    { ciudad: "tucuman", metrosCubicos: 1.8, precio: 117125.60 },
    { ciudad: "tucuman", metrosCubicos: 2, precio: 125513.04 },
    { ciudad: "tucuman", metrosCubicos: 0.25, precio: 15694.62 },

    { ciudad: "santa fe", metrosCubicos: 0.02, precio: 9379.93 },
    { ciudad: "santa fe", metrosCubicos: 0.04, precio: 9850.70 },
    { ciudad: "santa fe", metrosCubicos: 0.08, precio: 10346.24 },
    { ciudad: "santa fe", metrosCubicos: 0.1, precio: 10866.56 },
    { ciudad: "santa fe", metrosCubicos: 0.2, precio: 11411.66 },
    { ciudad: "santa fe", metrosCubicos: 0.3, precio: 15407.87 },
    { ciudad: "santa fe", metrosCubicos: 0.4, precio: 20802.21 },
    { ciudad: "santa fe", metrosCubicos: 0.5, precio: 29123.81 },
    { ciudad: "santa fe", metrosCubicos: 0.6, precio: 30582.12 },
    { ciudad: "santa fe", metrosCubicos: 0.7, precio: 32111.23 },
    { ciudad: "santa fe", metrosCubicos: 0.8, precio: 33718.20 },
    { ciudad: "santa fe", metrosCubicos: 0.9, precio: 35406.59 },
    { ciudad: "santa fe", metrosCubicos: 1, precio: 37179.93 },
    { ciudad: "santa fe", metrosCubicos: 1.2, precio: 39041.76 },
    { ciudad: "santa fe", metrosCubicos: 1.4, precio: 40995.62 },
    { ciudad: "santa fe", metrosCubicos: 1.6, precio: 43048.58 },
    { ciudad: "santa fe", metrosCubicos: 1.8, precio: 45204.20 },
    { ciudad: "santa fe", metrosCubicos: 2, precio: 47466.00 },
    { ciudad: "santa fe", metrosCubicos: 0.25, precio: 5933.25 },

    { ciudad: "neuquen", metrosCubicos: 0.02, precio: 9467.71 },
    { ciudad: "neuquen", metrosCubicos: 0.04, precio: 11074.94 },
    { ciudad: "neuquen", metrosCubicos: 0.08, precio: 14535.31 },
    { ciudad: "neuquen", metrosCubicos: 0.1, precio: 16037.14 },
    { ciudad: "neuquen", metrosCubicos: 0.2, precio: 19251.60 },
    { ciudad: "neuquen", metrosCubicos: 0.3, precio: 24073.28 },
    { ciudad: "neuquen", metrosCubicos: 0.4, precio: 32074.29 },
    { ciudad: "neuquen", metrosCubicos: 0.5, precio: 41937.22 },
    { ciudad: "neuquen", metrosCubicos: 0.6, precio: 50298.31 },
    { ciudad: "neuquen", metrosCubicos: 0.7, precio: 58694.54 },
    { ciudad: "neuquen", metrosCubicos: 0.8, precio: 67055.64 },
    { ciudad: "neuquen", metrosCubicos: 0.9, precio: 75460.64 },
    { ciudad: "neuquen", metrosCubicos: 1, precio: 83821.74 },
    { ciudad: "neuquen", metrosCubicos: 1.2, precio: 92051.10 },
    { ciudad: "neuquen", metrosCubicos: 1.4, precio: 100394.63 },
    { ciudad: "neuquen", metrosCubicos: 1.6, precio: 108782.07 },
    { ciudad: "neuquen", metrosCubicos: 1.8, precio: 117125.60 },
    { ciudad: "neuquen", metrosCubicos: 2, precio: 125513.04 },
    { ciudad: "neuquen", metrosCubicos: 0.25, precio: 15694.62 },

    { ciudad: "rio negro", metrosCubicos: 0.02, precio: 9467.71 },
    { ciudad: "rio negro", metrosCubicos: 0.04, precio: 11074.94 },
    { ciudad: "rio negro", metrosCubicos: 0.08, precio: 14535.31 },
    { ciudad: "rio negro", metrosCubicos: 0.1, precio: 16037.14 },
    { ciudad: "rio negro", metrosCubicos: 0.2, precio: 19251.60 },
    { ciudad: "rio negro", metrosCubicos: 0.3, precio: 24073.28 },
    { ciudad: "rio negro", metrosCubicos: 0.4, precio: 32074.29 },
    { ciudad: "rio negro", metrosCubicos: 0.5, precio: 41937.22 },
    { ciudad: "rio negro", metrosCubicos: 0.6, precio: 50298.31 },
    { ciudad: "rio negro", metrosCubicos: 0.7, precio: 58694.54 },
    { ciudad: "rio negro", metrosCubicos: 0.8, precio: 67055.64 },
    { ciudad: "rio negro", metrosCubicos: 0.9, precio: 75460.64 },
    { ciudad: "rio negro", metrosCubicos: 1, precio: 83821.74 },
    { ciudad: "rio negro", metrosCubicos: 1.2, precio: 92051.10 },
    { ciudad: "rio negro", metrosCubicos: 1.4, precio: 100394.63 },
    { ciudad: "rio negro", metrosCubicos: 1.6, precio: 108782.07 },
    { ciudad: "rio negro", metrosCubicos: 1.8, precio: 117125.60 },
    { ciudad: "rio negro", metrosCubicos: 2, precio: 125513.04 },
    { ciudad: "rio negro", metrosCubicos: 0.25, precio: 15694.62 },

    { ciudad: "chubut", metrosCubicos: 0.02, precio: 9467.71 },
    { ciudad: "chubut", metrosCubicos: 0.04, precio: 11074.94 },
    { ciudad: "chubut", metrosCubicos: 0.08, precio: 14535.31 },
    { ciudad: "chubut", metrosCubicos: 0.1, precio: 16037.14 },
    { ciudad: "chubut", metrosCubicos: 0.2, precio: 19251.60 },
    { ciudad: "chubut", metrosCubicos: 0.3, precio: 24073.28 },
    { ciudad: "chubut", metrosCubicos: 0.4, precio: 32074.29 },
    { ciudad: "chubut", metrosCubicos: 0.5, precio: 41937.22 },
    { ciudad: "chubut", metrosCubicos: 0.6, precio: 50298.31 },
    { ciudad: "chubut", metrosCubicos: 0.7, precio: 58694.54 },
    { ciudad: "chubut", metrosCubicos: 0.8, precio: 67055.64 },
    { ciudad: "chubut", metrosCubicos: 0.9, precio: 75460.64 },
    { ciudad: "chubut", metrosCubicos: 1, precio: 83821.74 },
    { ciudad: "chubut", metrosCubicos: 1.2, precio: 92051.10 },
    { ciudad: "chubut", metrosCubicos: 1.4, precio: 100394.63 },
    { ciudad: "chubut", metrosCubicos: 1.6, precio: 108782.07 },
    { ciudad: "chubut", metrosCubicos: 1.8, precio: 117125.60 },
    { ciudad: "chubut", metrosCubicos: 2, precio: 125513.04 },
    { ciudad: "chubut", metrosCubicos: 0.25, precio: 15694.62 },

    { ciudad: "santa cruz", metrosCubicos: 0.02, precio: 9467.71 },
    { ciudad: "santa cruz", metrosCubicos: 0.04, precio: 11074.94 },
    { ciudad: "santa cruz", metrosCubicos: 0.08, precio: 14535.31 },
    { ciudad: "santa cruz", metrosCubicos: 0.1, precio: 16037.14 },
    { ciudad: "santa cruz", metrosCubicos: 0.2, precio: 19251.60 },
    { ciudad: "santa cruz", metrosCubicos: 0.3, precio: 24073.28 },
    { ciudad: "santa cruz", metrosCubicos: 0.4, precio: 32074.29 },
    { ciudad: "santa cruz", metrosCubicos: 0.5, precio: 41937.22 },
    { ciudad: "santa cruz", metrosCubicos: 0.6, precio: 50298.31 },
    { ciudad: "santa cruz", metrosCubicos: 0.7, precio: 58694.54 },
    { ciudad: "santa cruz", metrosCubicos: 0.8, precio: 67055.64 },
    { ciudad: "santa cruz", metrosCubicos: 0.9, precio: 75460.64 },
    { ciudad: "santa cruz", metrosCubicos: 1, precio: 83821.74 },
    { ciudad: "santa cruz", metrosCubicos: 1.2, precio: 92051.10 },
    { ciudad: "santa cruz", metrosCubicos: 1.4, precio: 100394.63 },
    { ciudad: "santa cruz", metrosCubicos: 1.6, precio: 108782.07 },
    { ciudad: "santa cruz", metrosCubicos: 1.8, precio: 117125.60 },
    { ciudad: "santa cruz", metrosCubicos: 2, precio: 125513.04 },
    { ciudad: "santa cruz", metrosCubicos: 0.25, precio: 15694.62 },

    { ciudad: "jujuy", metrosCubicos: 0.02, precio: 9467.71 },
    { ciudad: "jujuy", metrosCubicos: 0.04, precio: 11074.94 },
    { ciudad: "jujuy", metrosCubicos: 0.08, precio: 14535.31 },
    { ciudad: "jujuy", metrosCubicos: 0.1, precio: 16037.14 },
    { ciudad: "jujuy", metrosCubicos: 0.2, precio: 19251.60 },
    { ciudad: "jujuy", metrosCubicos: 0.3, precio: 24073.28 },
    { ciudad: "jujuy", metrosCubicos: 0.4, precio: 32074.29 },
    { ciudad: "jujuy", metrosCubicos: 0.5, precio: 41937.22 },
    { ciudad: "jujuy", metrosCubicos: 0.6, precio: 50298.31 },
    { ciudad: "jujuy", metrosCubicos: 0.7, precio: 58694.54 },
    { ciudad: "jujuy", metrosCubicos: 0.8, precio: 67055.64 },
    { ciudad: "jujuy", metrosCubicos: 0.9, precio: 75460.64 },
    { ciudad: "jujuy", metrosCubicos: 1, precio: 83821.74 },
    { ciudad: "jujuy", metrosCubicos: 1.2, precio: 92051.10 },
    { ciudad: "jujuy", metrosCubicos: 1.4, precio: 100394.63 },
    { ciudad: "jujuy", metrosCubicos: 1.6, precio: 108782.07 },
    { ciudad: "jujuy", metrosCubicos: 1.8, precio: 117125.60 },
    { ciudad: "jujuy", metrosCubicos: 2, precio: 125513.04 },
    { ciudad: "jujuy", metrosCubicos: 0.25, precio: 15694.62 },
];

// Función para formatear el precio
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(precio);
}

// Función para mostrar el spinner
function mostrarSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'spinner-border text-success';
    spinner.role = 'status';
    spinner.innerHTML = '<span class="visually-hidden">Cargando...</span>';

    const spinnerContainer = document.createElement('div');
    spinnerContainer.appendChild(spinner);
    spinnerContainer.appendChild(document.createTextNode(' Esperando...'));

    const valorCotizacion = document.getElementById('valor-cotizacion2');
    valorCotizacion.innerHTML = ''; // Limpiar el contenido anterior
    valorCotizacion.appendChild(spinnerContainer);
}

// Función para ocultar el spinner y mostrar el precio
function mostrarPrecio(precio) {
    const valorCotizacion = document.getElementById('valor-cotizacion2');
    if (isNaN(precio)) {
        valorCotizacion.innerText = 'NO DISPONIBLE';
    } else {
        valorCotizacion.innerText = formatearPrecio(precio);
    }
}

// Modificar la función buscarPrecio
function buscarPrecio(provincia, volumen) {
    console.log(`Buscando precio para ${provincia} con volumen ${volumen}...`);
    
    const preciosProvincia = precios.filter(p => p.ciudad === provincia);
    
    if (preciosProvincia.length === 0) {
        console.log("Envío no disponible para esta provincia.");
        mostrarPrecio(NaN); // Pasar NaN para mostrar "No disponible"
        return;
    }

    let precioBase = null;
    let precioDosMetros = null;

    // Buscar precios para 2 metros cúbicos y para el volumen actual
    for (let i = 0; i < preciosProvincia.length; i++) {
        const precioObj = preciosProvincia[i];
        if (volumen <= precioObj.metrosCubicos) {
            precioBase = precioObj.precio;
            console.log(`Precio encontrado: ${precioBase} para ${precioObj.metrosCubicos} m³`);
            break;
        }
        if (precioObj.metrosCubicos === 2) {
            precioDosMetros = precioObj.precio;
        }
    }

    if (!precioBase) {
        if (precioDosMetros) {
            precioBase = precioDosMetros;
            console.log(`Usando precio de 2 m³: ${precioBase}`);
        } else {
            console.log("No se encontró un precio válido.");
            mostrarPrecio(NaN); // Pasar NaN para mostrar "No disponible"
            return;
        }
    }

    // Sumar el 21%
    const precioConImpuesto = precioBase * 1.21;
    console.log(`Precio con impuesto (21%): ${precioConImpuesto}`);

    // Calcular el exceso si el volumen es mayor a 2
    if (volumen > 2) {
        const exceso = volumen - 2;
        const cantidadExcesos = Math.ceil(exceso / 0.25); // Redondear hacia arriba
        const precioExceso = preciosProvincia.find(p => p.metrosCubicos === 0.25).precio;

        console.log(`Exceso de volumen: ${exceso} m³`);
        console.log(`Cantidad de excesos (0.25 m³): ${cantidadExcesos}`);
        console.log(`Precio por cada 0.25 m³: ${precioExceso}`);

        const costoExceso = cantidadExcesos * precioExceso;
        console.log(`Costo total por exceso: ${costoExceso}`);

        const precioFinal = precioConImpuesto + costoExceso;
        console.log(`Precio final (con exceso): ${precioFinal}`);
        
        mostrarPrecio(precioFinal);
    } else {
        mostrarPrecio(precioConImpuesto);
    }
}

// Función para manejar cambios en los campos
function manejarCambio() {
    const provinciaElement = document.getElementById('nombre-provincia');
    const volumenElement = document.getElementById('volumenTotal');

    if (!provinciaElement || !volumenElement) {
        console.error("Elementos de provincia o volumen no encontrados.");
        return;
    }

    const provincia = provinciaElement.innerText.toLowerCase();
    const volumen = parseFloat(volumenElement.innerText);

    mostrarSpinner(); // Mostrar spinner

    setTimeout(() => {
        buscarPrecio(provincia, volumen);
    }, 1000); // Retraso de 1 segundo
}

// Al cargar la página, mostrar el spinner
window.onload = mostrarSpinner;

// Observador para cambios en la provincia
const provinciaElement = document.getElementById('nombre-provincia');
if (provinciaElement) {
    const observerProvincia = new MutationObserver(manejarCambio);
    observerProvincia.observe(provinciaElement, { childList: true, subtree: true });
} else {
    console.error("Elemento 'nombre-provincia' no encontrado.");
}

// Observador para cambios en el volumen
const volumenElement = document.getElementById('volumenTotal');
if (volumenElement) {
    const observerVolumen = new MutationObserver(manejarCambio);
    observerVolumen.observe(volumenElement, { childList: true, subtree: true });
} else {
    console.error("Elemento 'volumenTotal' no encontrado.");
}
