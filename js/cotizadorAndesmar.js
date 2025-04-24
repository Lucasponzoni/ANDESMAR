const precios = [
    { ciudad: "buenos aires", metrosCubicos: 0.02, precio: 6418.45 },
    { ciudad: "buenos aires", metrosCubicos: 0.04, precio: 7511.74 },
    { ciudad: "buenos aires", metrosCubicos: 0.08, precio: 9854.51 },
    { ciudad: "buenos aires", metrosCubicos: 0.1, precio: 10880.86 },
    { ciudad: "buenos aires", metrosCubicos: 0.2, precio: 13045.14 },
    { ciudad: "buenos aires", metrosCubicos: 0.3, precio: 16317.58 },
    { ciudad: "buenos aires", metrosCubicos: 0.4, precio: 21739.42 },
    { ciudad: "buenos aires", metrosCubicos: 0.5, precio: 28410.73 },
    { ciudad: "buenos aires", metrosCubicos: 0.6, precio: 34078.00 },
    { ciudad: "buenos aires", metrosCubicos: 0.7, precio: 39767.59 },
    { ciudad: "buenos aires", metrosCubicos: 0.8, precio: 45434.86 },
    { ciudad: "buenos aires", metrosCubicos: 0.9, precio: 51131.88 },
    { ciudad: "buenos aires", metrosCubicos: 1, precio: 56784.28 },
    { ciudad: "buenos aires", metrosCubicos: 1.2, precio: 62369.74 },
    { ciudad: "buenos aires", metrosCubicos: 1.4, precio: 68029.57 },
    { ciudad: "buenos aires", metrosCubicos: 1.6, precio: 73704.28 },
    { ciudad: "buenos aires", metrosCubicos: 1.8, precio: 79356.68 },
    { ciudad: "buenos aires", metrosCubicos: 2, precio: 85031.39 },
    { ciudad: "buenos aires", metrosCubicos: 0.25, precio: 10635.43 },

    { ciudad: "capital federal", metrosCubicos: 0.02, precio: 6418.45 },
    { ciudad: "capital federal", metrosCubicos: 0.04, precio: 7511.74 },
    { ciudad: "capital federal", metrosCubicos: 0.08, precio: 9854.51 },
    { ciudad: "capital federal", metrosCubicos: 0.1, precio: 10880.86 },
    { ciudad: "capital federal", metrosCubicos: 0.2, precio: 13045.14 },
    { ciudad: "capital federal", metrosCubicos: 0.3, precio: 16317.58 },
    { ciudad: "capital federal", metrosCubicos: 0.4, precio: 21739.42 },
    { ciudad: "capital federal", metrosCubicos: 0.5, precio: 28410.73 },
    { ciudad: "capital federal", metrosCubicos: 0.6, precio: 34078.00 },
    { ciudad: "capital federal", metrosCubicos: 0.7, precio: 39767.59 },
    { ciudad: "capital federal", metrosCubicos: 0.8, precio: 45434.86 },
    { ciudad: "capital federal", metrosCubicos: 0.9, precio: 51131.88 },
    { ciudad: "capital federal", metrosCubicos: 1, precio: 56784.28 },
    { ciudad: "capital federal", metrosCubicos: 1.2, precio: 62369.74 },
    { ciudad: "capital federal", metrosCubicos: 1.4, precio: 68029.57 },
    { ciudad: "capital federal", metrosCubicos: 1.6, precio: 73704.28 },
    { ciudad: "capital federal", metrosCubicos: 1.8, precio: 79356.68 },
    { ciudad: "capital federal", metrosCubicos: 2, precio: 85031.39 },
    { ciudad: "capital federal", metrosCubicos: 0.25, precio: 10635.43 },  

    { ciudad: "cordoba", metrosCubicos: 0.02, precio: 6418.45 },
    { ciudad: "cordoba", metrosCubicos: 0.04, precio: 7511.74 },
    { ciudad: "cordoba", metrosCubicos: 0.08, precio: 9854.51 },
    { ciudad: "cordoba", metrosCubicos: 0.1, precio: 10880.86 },
    { ciudad: "cordoba", metrosCubicos: 0.2, precio: 13045.14 },
    { ciudad: "cordoba", metrosCubicos: 0.3, precio: 16317.58 },
    { ciudad: "cordoba", metrosCubicos: 0.4, precio: 21739.42 },
    { ciudad: "cordoba", metrosCubicos: 0.5, precio: 28410.73 },
    { ciudad: "cordoba", metrosCubicos: 0.6, precio: 34078.00 },
    { ciudad: "cordoba", metrosCubicos: 0.7, precio: 39767.59 },
    { ciudad: "cordoba", metrosCubicos: 0.8, precio: 45434.86 },
    { ciudad: "cordoba", metrosCubicos: 0.9, precio: 51131.88 },
    { ciudad: "cordoba", metrosCubicos: 1, precio: 56784.28 },
    { ciudad: "cordoba", metrosCubicos: 1.2, precio: 62369.74 },
    { ciudad: "cordoba", metrosCubicos: 1.4, precio: 68029.57 },
    { ciudad: "cordoba", metrosCubicos: 1.6, precio: 73704.28 },
    { ciudad: "cordoba", metrosCubicos: 1.8, precio: 79356.68 },
    { ciudad: "cordoba", metrosCubicos: 2, precio: 85031.39 },
    { ciudad: "cordoba", metrosCubicos: 0.25, precio: 10635.43 },    

    { ciudad: "mendoza", metrosCubicos: 0.02, precio: 8017.48 },
    { ciudad: "mendoza", metrosCubicos: 0.04, precio: 9378.52 },
    { ciudad: "mendoza", metrosCubicos: 0.08, precio: 12308.84 },
    { ciudad: "mendoza", metrosCubicos: 0.1, precio: 13580.63 },
    { ciudad: "mendoza", metrosCubicos: 0.2, precio: 16302.70 },
    { ciudad: "mendoza", metrosCubicos: 0.3, precio: 20385.82 },
    { ciudad: "mendoza", metrosCubicos: 0.4, precio: 27161.25 },
    { ciudad: "mendoza", metrosCubicos: 0.5, precio: 35513.41 },
    { ciudad: "mendoza", metrosCubicos: 0.6, precio: 42593.79 },
    { ciudad: "mendoza", metrosCubicos: 0.7, precio: 49703.91 },
    { ciudad: "mendoza", metrosCubicos: 0.8, precio: 56784.28 },
    { ciudad: "mendoza", metrosCubicos: 0.9, precio: 63901.83 },
    { ciudad: "mendoza", metrosCubicos: 1, precio: 70982.21 },
    { ciudad: "mendoza", metrosCubicos: 1.2, precio: 77951.02 },
    { ciudad: "mendoza", metrosCubicos: 1.4, precio: 85016.51 },
    { ciudad: "mendoza", metrosCubicos: 1.6, precio: 92119.20 },
    { ciudad: "mendoza", metrosCubicos: 1.8, precio: 99184.69 },
    { ciudad: "mendoza", metrosCubicos: 2, precio: 106287.37 },
    { ciudad: "mendoza", metrosCubicos: 0.25, precio: 13290.57 },    

    { ciudad: "san juan", metrosCubicos: 0.02, precio: 8017.48 },
    { ciudad: "san juan", metrosCubicos: 0.04, precio: 9378.52 },
    { ciudad: "san juan", metrosCubicos: 0.08, precio: 12308.84 },
    { ciudad: "san juan", metrosCubicos: 0.1, precio: 13580.63 },
    { ciudad: "san juan", metrosCubicos: 0.2, precio: 16302.70 },
    { ciudad: "san juan", metrosCubicos: 0.3, precio: 20385.82 },
    { ciudad: "san juan", metrosCubicos: 0.4, precio: 27161.25 },
    { ciudad: "san juan", metrosCubicos: 0.5, precio: 35513.41 },
    { ciudad: "san juan", metrosCubicos: 0.6, precio: 42593.79 },
    { ciudad: "san juan", metrosCubicos: 0.7, precio: 49703.91 },
    { ciudad: "san juan", metrosCubicos: 0.8, precio: 56784.28 },
    { ciudad: "san juan", metrosCubicos: 0.9, precio: 63901.83 },
    { ciudad: "san juan", metrosCubicos: 1, precio: 70982.21 },
    { ciudad: "san juan", metrosCubicos: 1.2, precio: 77951.02 },
    { ciudad: "san juan", metrosCubicos: 1.4, precio: 85016.51 },
    { ciudad: "san juan", metrosCubicos: 1.6, precio: 92119.20 },
    { ciudad: "san juan", metrosCubicos: 1.8, precio: 99184.69 },
    { ciudad: "san juan", metrosCubicos: 2, precio: 106287.37 },
    { ciudad: "san juan", metrosCubicos: 0.25, precio: 13290.57 },    

    { ciudad: "san luis", metrosCubicos: 0.02, precio: 8017.48 },
    { ciudad: "san luis", metrosCubicos: 0.04, precio: 9378.52 },
    { ciudad: "san luis", metrosCubicos: 0.08, precio: 12308.84 },
    { ciudad: "san luis", metrosCubicos: 0.1, precio: 13580.63 },
    { ciudad: "san luis", metrosCubicos: 0.2, precio: 16302.70 },
    { ciudad: "san luis", metrosCubicos: 0.3, precio: 20385.82 },
    { ciudad: "san luis", metrosCubicos: 0.4, precio: 27161.25 },
    { ciudad: "san luis", metrosCubicos: 0.5, precio: 35513.41 },
    { ciudad: "san luis", metrosCubicos: 0.6, precio: 42593.79 },
    { ciudad: "san luis", metrosCubicos: 0.7, precio: 49703.91 },
    { ciudad: "san luis", metrosCubicos: 0.8, precio: 56784.28 },
    { ciudad: "san luis", metrosCubicos: 0.9, precio: 63901.83 },
    { ciudad: "san luis", metrosCubicos: 1, precio: 70982.21 },
    { ciudad: "san luis", metrosCubicos: 1.2, precio: 77951.02 },
    { ciudad: "san luis", metrosCubicos: 1.4, precio: 85016.51 },
    { ciudad: "san luis", metrosCubicos: 1.6, precio: 92119.20 },
    { ciudad: "san luis", metrosCubicos: 1.8, precio: 99184.69 },
    { ciudad: "san luis", metrosCubicos: 2, precio: 106287.37 },
    { ciudad: "san luis", metrosCubicos: 0.25, precio: 13290.57 },    

    { ciudad: "santiago del estero", metrosCubicos: 0.02, precio: 7878.59 },
    { ciudad: "santiago del estero", metrosCubicos: 0.04, precio: 9216.05 },
    { ciudad: "santiago del estero", metrosCubicos: 0.08, precio: 12095.61 },
    { ciudad: "santiago del estero", metrosCubicos: 0.1, precio: 13345.37 },
    { ciudad: "santiago del estero", metrosCubicos: 0.2, precio: 16020.29 },
    { ciudad: "santiago del estero", metrosCubicos: 0.3, precio: 20032.67 },
    { ciudad: "santiago del estero", metrosCubicos: 0.4, precio: 26690.74 },
    { ciudad: "santiago del estero", metrosCubicos: 0.5, precio: 34898.22 },
    { ciudad: "santiago del estero", metrosCubicos: 0.6, precio: 41855.94 },
    { ciudad: "santiago del estero", metrosCubicos: 0.7, precio: 48842.89 },
    { ciudad: "santiago del estero", metrosCubicos: 0.8, precio: 55800.61 },
    { ciudad: "santiago del estero", metrosCubicos: 0.9, precio: 62794.87 },
    { ciudad: "santiago del estero", metrosCubicos: 1, precio: 69752.58 },
    { ciudad: "santiago del estero", metrosCubicos: 1.2, precio: 76600.67 },
    { ciudad: "santiago del estero", metrosCubicos: 1.4, precio: 83543.77 },
    { ciudad: "santiago del estero", metrosCubicos: 1.6, precio: 90523.42 },
    { ciudad: "santiago del estero", metrosCubicos: 1.8, precio: 97466.52 },
    { ciudad: "santiago del estero", metrosCubicos: 2, precio: 104446.16 },
    { ciudad: "santiago del estero", metrosCubicos: 0.25, precio: 13060.34 },    

    { ciudad: "salta", metrosCubicos: 0.02, precio: 7878.59 },
    { ciudad: "salta", metrosCubicos: 0.04, precio: 9216.05 },
    { ciudad: "salta", metrosCubicos: 0.08, precio: 12095.61 },
    { ciudad: "salta", metrosCubicos: 0.1, precio: 13345.37 },
    { ciudad: "salta", metrosCubicos: 0.2, precio: 16020.29 },
    { ciudad: "salta", metrosCubicos: 0.3, precio: 20032.67 },
    { ciudad: "salta", metrosCubicos: 0.4, precio: 26690.74 },
    { ciudad: "salta", metrosCubicos: 0.5, precio: 34898.22 },
    { ciudad: "salta", metrosCubicos: 0.6, precio: 41855.94 },
    { ciudad: "salta", metrosCubicos: 0.7, precio: 48842.89 },
    { ciudad: "salta", metrosCubicos: 0.8, precio: 55800.61 },
    { ciudad: "salta", metrosCubicos: 0.9, precio: 62794.87 },
    { ciudad: "salta", metrosCubicos: 1, precio: 69752.58 },
    { ciudad: "salta", metrosCubicos: 1.2, precio: 76600.67 },
    { ciudad: "salta", metrosCubicos: 1.4, precio: 83543.77 },
    { ciudad: "salta", metrosCubicos: 1.6, precio: 90523.42 },
    { ciudad: "salta", metrosCubicos: 1.8, precio: 97466.52 },
    { ciudad: "salta", metrosCubicos: 2, precio: 104446.16 },
    { ciudad: "salta", metrosCubicos: 0.25, precio: 13060.34 },    

    { ciudad: "catamarca", metrosCubicos: 0.02, precio: 7878.59 },
    { ciudad: "catamarca", metrosCubicos: 0.04, precio: 9216.05 },
    { ciudad: "catamarca", metrosCubicos: 0.08, precio: 12095.61 },
    { ciudad: "catamarca", metrosCubicos: 0.1, precio: 13345.37 },
    { ciudad: "catamarca", metrosCubicos: 0.2, precio: 16020.29 },
    { ciudad: "catamarca", metrosCubicos: 0.3, precio: 20032.67 },
    { ciudad: "catamarca", metrosCubicos: 0.4, precio: 26690.74 },
    { ciudad: "catamarca", metrosCubicos: 0.5, precio: 34898.22 },
    { ciudad: "catamarca", metrosCubicos: 0.6, precio: 41855.94 },
    { ciudad: "catamarca", metrosCubicos: 0.7, precio: 48842.89 },
    { ciudad: "catamarca", metrosCubicos: 0.8, precio: 55800.61 },
    { ciudad: "catamarca", metrosCubicos: 0.9, precio: 62794.87 },
    { ciudad: "catamarca", metrosCubicos: 1, precio: 69752.58 },
    { ciudad: "catamarca", metrosCubicos: 1.2, precio: 76600.67 },
    { ciudad: "catamarca", metrosCubicos: 1.4, precio: 83543.77 },
    { ciudad: "catamarca", metrosCubicos: 1.6, precio: 90523.42 },
    { ciudad: "catamarca", metrosCubicos: 1.8, precio: 97466.52 },
    { ciudad: "catamarca", metrosCubicos: 2, precio: 104446.16 },
    { ciudad: "catamarca", metrosCubicos: 0.25, precio: 13060.34 },    

    { ciudad: "la rioja", metrosCubicos: 0.02, precio: 7878.59 },
    { ciudad: "la rioja", metrosCubicos: 0.04, precio: 9216.05 },
    { ciudad: "la rioja", metrosCubicos: 0.08, precio: 12095.61 },
    { ciudad: "la rioja", metrosCubicos: 0.1, precio: 13345.37 },
    { ciudad: "la rioja", metrosCubicos: 0.2, precio: 16020.29 },
    { ciudad: "la rioja", metrosCubicos: 0.3, precio: 20032.67 },
    { ciudad: "la rioja", metrosCubicos: 0.4, precio: 26690.74 },
    { ciudad: "la rioja", metrosCubicos: 0.5, precio: 34898.22 },
    { ciudad: "la rioja", metrosCubicos: 0.6, precio: 41855.94 },
    { ciudad: "la rioja", metrosCubicos: 0.7, precio: 48842.89 },
    { ciudad: "la rioja", metrosCubicos: 0.8, precio: 55800.61 },
    { ciudad: "la rioja", metrosCubicos: 0.9, precio: 62794.87 },
    { ciudad: "la rioja", metrosCubicos: 1, precio: 69752.58 },
    { ciudad: "la rioja", metrosCubicos: 1.2, precio: 76600.67 },
    { ciudad: "la rioja", metrosCubicos: 1.4, precio: 83543.77 },
    { ciudad: "la rioja", metrosCubicos: 1.6, precio: 90523.42 },
    { ciudad: "la rioja", metrosCubicos: 1.8, precio: 97466.52 },
    { ciudad: "la rioja", metrosCubicos: 2, precio: 104446.16 },
    { ciudad: "la rioja", metrosCubicos: 0.25, precio: 13060.34 },    

    { ciudad: "tucuman", metrosCubicos: 0.02, precio: 7878.59 },
    { ciudad: "tucuman", metrosCubicos: 0.04, precio: 9216.05 },
    { ciudad: "tucuman", metrosCubicos: 0.08, precio: 12095.61 },
    { ciudad: "tucuman", metrosCubicos: 0.1, precio: 13345.37 },
    { ciudad: "tucuman", metrosCubicos: 0.2, precio: 16020.29 },
    { ciudad: "tucuman", metrosCubicos: 0.3, precio: 20032.67 },
    { ciudad: "tucuman", metrosCubicos: 0.4, precio: 26690.74 },
    { ciudad: "tucuman", metrosCubicos: 0.5, precio: 34898.22 },
    { ciudad: "tucuman", metrosCubicos: 0.6, precio: 41855.94 },
    { ciudad: "tucuman", metrosCubicos: 0.7, precio: 48842.89 },
    { ciudad: "tucuman", metrosCubicos: 0.8, precio: 55800.61 },
    { ciudad: "tucuman", metrosCubicos: 0.9, precio: 62794.87 },
    { ciudad: "tucuman", metrosCubicos: 1, precio: 69752.58 },
    { ciudad: "tucuman", metrosCubicos: 1.2, precio: 76600.67 },
    { ciudad: "tucuman", metrosCubicos: 1.4, precio: 83543.77 },
    { ciudad: "tucuman", metrosCubicos: 1.6, precio: 90523.42 },
    { ciudad: "tucuman", metrosCubicos: 1.8, precio: 97466.52 },
    { ciudad: "tucuman", metrosCubicos: 2, precio: 104446.16 },
    { ciudad: "tucuman", metrosCubicos: 0.25, precio: 13060.34 },    

    { ciudad: "santa fe", metrosCubicos: 0.02, precio: 14550.72 },
    { ciudad: "santa fe", metrosCubicos: 0.04, precio: 15278.25 },
    { ciudad: "santa fe", metrosCubicos: 0.08, precio: 16044.08 },
    { ciudad: "santa fe", metrosCubicos: 0.1, precio: 16848.20 },
    { ciudad: "santa fe", metrosCubicos: 0.2, precio: 17690.61 },
    { ciudad: "santa fe", metrosCubicos: 0.3, precio: 23882.32 },
    { ciudad: "santa fe", metrosCubicos: 0.4, precio: 32241.33 },
    { ciudad: "santa fe", metrosCubicos: 0.5, precio: 45137.86 },
    { ciudad: "santa fe", metrosCubicos: 0.6, precio: 46041.53 },
    { ciudad: "santa fe", metrosCubicos: 0.7, precio: 46964.36 },
    { ciudad: "santa fe", metrosCubicos: 0.8, precio: 47906.32 },
    { ciudad: "santa fe", metrosCubicos: 0.9, precio: 48867.44 },
    { ciudad: "santa fe", metrosCubicos: 1, precio: 49847.70 },
    { ciudad: "santa fe", metrosCubicos: 1.2, precio: 50847.10 },
    { ciudad: "santa fe", metrosCubicos: 1.4, precio: 51865.65 },
    { ciudad: "santa fe", metrosCubicos: 1.6, precio: 52903.35 },
    { ciudad: "santa fe", metrosCubicos: 1.8, precio: 53964.02 },
    { ciudad: "santa fe", metrosCubicos: 2, precio: 55043.83 },
    { ciudad: "santa fe", metrosCubicos: 0.25, precio: 6880.48 },    

    { ciudad: "neuquen", metrosCubicos: 0.02, precio: 10242.17 },
    { ciudad: "neuquen", metrosCubicos: 0.04, precio: 11980.87 },
    { ciudad: "neuquen", metrosCubicos: 0.08, precio: 15724.30 },
    { ciudad: "neuquen", metrosCubicos: 0.1, precio: 17348.98 },
    { ciudad: "neuquen", metrosCubicos: 0.2, precio: 20826.38 },
    { ciudad: "neuquen", metrosCubicos: 0.3, precio: 26042.47 },
    { ciudad: "neuquen", metrosCubicos: 0.4, precio: 34697.96 },
    { ciudad: "neuquen", metrosCubicos: 0.5, precio: 45367.68 },
    { ciudad: "neuquen", metrosCubicos: 0.6, precio: 54412.72 },
    { ciudad: "neuquen", metrosCubicos: 0.7, precio: 63495.75 },
    { ciudad: "neuquen", metrosCubicos: 0.8, precio: 72540.79 },
    { ciudad: "neuquen", metrosCubicos: 0.9, precio: 81633.33 },
    { ciudad: "neuquen", metrosCubicos: 1, precio: 90678.36 },
    { ciudad: "neuquen", metrosCubicos: 1.2, precio: 99580.88 },
    { ciudad: "neuquen", metrosCubicos: 1.4, precio: 108606.91 },
    { ciudad: "neuquen", metrosCubicos: 1.6, precio: 117680.44 },
    { ciudad: "neuquen", metrosCubicos: 1.8, precio: 126706.47 },
    { ciudad: "neuquen", metrosCubicos: 2, precio: 135780.01 },
    { ciudad: "neuquen", metrosCubicos: 0.25, precio: 16978.44 },    

    { ciudad: "rio negro", metrosCubicos: 0.02, precio: 10242.17 },
    { ciudad: "rio negro", metrosCubicos: 0.04, precio: 11980.87 },
    { ciudad: "rio negro", metrosCubicos: 0.08, precio: 15724.30 },
    { ciudad: "rio negro", metrosCubicos: 0.1, precio: 17348.98 },
    { ciudad: "rio negro", metrosCubicos: 0.2, precio: 20826.38 },
    { ciudad: "rio negro", metrosCubicos: 0.3, precio: 26042.47 },
    { ciudad: "rio negro", metrosCubicos: 0.4, precio: 34697.96 },
    { ciudad: "rio negro", metrosCubicos: 0.5, precio: 45367.68 },
    { ciudad: "rio negro", metrosCubicos: 0.6, precio: 54412.72 },
    { ciudad: "rio negro", metrosCubicos: 0.7, precio: 63495.75 },
    { ciudad: "rio negro", metrosCubicos: 0.8, precio: 72540.79 },
    { ciudad: "rio negro", metrosCubicos: 0.9, precio: 81633.33 },
    { ciudad: "rio negro", metrosCubicos: 1, precio: 90678.36 },
    { ciudad: "rio negro", metrosCubicos: 1.2, precio: 99580.88 },
    { ciudad: "rio negro", metrosCubicos: 1.4, precio: 108606.91 },
    { ciudad: "rio negro", metrosCubicos: 1.6, precio: 117680.44 },
    { ciudad: "rio negro", metrosCubicos: 1.8, precio: 126706.47 },
    { ciudad: "rio negro", metrosCubicos: 2, precio: 135780.01 },
    { ciudad: "rio negro", metrosCubicos: 0.25, precio: 16978.44 },    

    { ciudad: "chubut", metrosCubicos: 0.02, precio: 11817.89 },
    { ciudad: "chubut", metrosCubicos: 0.04, precio: 13824.08 },
    { ciudad: "chubut", metrosCubicos: 0.08, precio: 18143.42 },
    { ciudad: "chubut", metrosCubicos: 0.1, precio: 20018.06 },
    { ciudad: "chubut", metrosCubicos: 0.2, precio: 24030.44 },
    { ciudad: "chubut", metrosCubicos: 0.3, precio: 30049.01 },
    { ciudad: "chubut", metrosCubicos: 0.4, precio: 40036.11 },
    { ciudad: "chubut", metrosCubicos: 0.5, precio: 52347.33 },
    { ciudad: "chubut", metrosCubicos: 0.6, precio: 62783.90 },
    { ciudad: "chubut", metrosCubicos: 0.7, precio: 73264.33 },
    { ciudad: "chubut", metrosCubicos: 0.8, precio: 83700.91 },
    { ciudad: "chubut", metrosCubicos: 0.9, precio: 94192.30 },
    { ciudad: "chubut", metrosCubicos: 1, precio: 104628.88 },
    { ciudad: "chubut", metrosCubicos: 1.2, precio: 114901.01 },
    { ciudad: "chubut", metrosCubicos: 1.4, precio: 125315.66 },
    { ciudad: "chubut", metrosCubicos: 1.6, precio: 135785.13 },
    { ciudad: "chubut", metrosCubicos: 1.8, precio: 146199.78 },
    { ciudad: "chubut", metrosCubicos: 2, precio: 156669.24 },
    { ciudad: "chubut", metrosCubicos: 0.25, precio: 19590.51 },    

    { ciudad: "santa cruz", metrosCubicos: 0.02, precio: 16545.04 },
    { ciudad: "santa cruz", metrosCubicos: 0.04, precio: 19353.71 },
    { ciudad: "santa cruz", metrosCubicos: 0.08, precio: 25400.79 },
    { ciudad: "santa cruz", metrosCubicos: 0.1, precio: 28025.28 },
    { ciudad: "santa cruz", metrosCubicos: 0.2, precio: 33642.61 },
    { ciudad: "santa cruz", metrosCubicos: 0.3, precio: 42068.61 },
    { ciudad: "santa cruz", metrosCubicos: 0.4, precio: 56050.56 },
    { ciudad: "santa cruz", metrosCubicos: 0.5, precio: 73286.26 },
    { ciudad: "santa cruz", metrosCubicos: 0.6, precio: 87897.46 },
    { ciudad: "santa cruz", metrosCubicos: 0.7, precio: 102570.06 },
    { ciudad: "santa cruz", metrosCubicos: 0.8, precio: 117181.27 },
    { ciudad: "santa cruz", metrosCubicos: 0.9, precio: 131869.22 },
    { ciudad: "santa cruz", metrosCubicos: 1, precio: 146480.43 },
    { ciudad: "santa cruz", metrosCubicos: 1.2, precio: 160861.41 },
    { ciudad: "santa cruz", metrosCubicos: 1.4, precio: 175441.93 },
    { ciudad: "santa cruz", metrosCubicos: 1.6, precio: 190099.18 },
    { ciudad: "santa cruz", metrosCubicos: 1.8, precio: 204679.69 },
    { ciudad: "santa cruz", metrosCubicos: 2, precio: 219336.94 },
    { ciudad: "santa cruz", metrosCubicos: 0.25, precio: 27426.71 },    

    { ciudad: "jujuy", metrosCubicos: 0.02, precio: 7878.59 },
    { ciudad: "jujuy", metrosCubicos: 0.04, precio: 9216.05 },
    { ciudad: "jujuy", metrosCubicos: 0.08, precio: 12095.61 },
    { ciudad: "jujuy", metrosCubicos: 0.1, precio: 13345.37 },
    { ciudad: "jujuy", metrosCubicos: 0.2, precio: 16020.29 },
    { ciudad: "jujuy", metrosCubicos: 0.3, precio: 20032.67 },
    { ciudad: "jujuy", metrosCubicos: 0.4, precio: 26690.74 },
    { ciudad: "jujuy", metrosCubicos: 0.5, precio: 34898.22 },
    { ciudad: "jujuy", metrosCubicos: 0.6, precio: 41855.94 },
    { ciudad: "jujuy", metrosCubicos: 0.7, precio: 48842.89 },
    { ciudad: "jujuy", metrosCubicos: 0.8, precio: 55800.61 },
    { ciudad: "jujuy", metrosCubicos: 0.9, precio: 62794.87 },
    { ciudad: "jujuy", metrosCubicos: 1, precio: 69752.58 },
    { ciudad: "jujuy", metrosCubicos: 1.2, precio: 76600.67 },
    { ciudad: "jujuy", metrosCubicos: 1.4, precio: 83543.77 },
    { ciudad: "jujuy", metrosCubicos: 1.6, precio: 90523.42 },
    { ciudad: "jujuy", metrosCubicos: 1.8, precio: 97466.52 },
    { ciudad: "jujuy", metrosCubicos: 2, precio: 104446.16 },
    { ciudad: "jujuy", metrosCubicos: 0.25, precio: 13060.34 },    

    { ciudad: "chaco", metrosCubicos: 0.02, precio: 12298.44 },
    { ciudad: "chaco", metrosCubicos: 0.04, precio: 12298.44 },
    { ciudad: "chaco", metrosCubicos: 0.08, precio: 12298.44 },
    { ciudad: "chaco", metrosCubicos: 0.1, precio: 20851.48 },
    { ciudad: "chaco", metrosCubicos: 0.2, precio: 27847.14 },
    { ciudad: "chaco", metrosCubicos: 0.3, precio: 33890.33 },
    { ciudad: "chaco", metrosCubicos: 0.4, precio: 33890.33 },
    { ciudad: "chaco", metrosCubicos: 0.5, precio: 43956.85 },
    { ciudad: "chaco", metrosCubicos: 0.6, precio: 43956.85 },
    { ciudad: "chaco", metrosCubicos: 0.7, precio: 43956.85 },
    { ciudad: "chaco", metrosCubicos: 0.8, precio: 43956.85 },
    { ciudad: "chaco", metrosCubicos: 0.9, precio: 43956.85 },
    { ciudad: "chaco", metrosCubicos: 1, precio: 63295.48 },
    { ciudad: "chaco", metrosCubicos: 1.2, precio: 63295.48 },
    { ciudad: "chaco", metrosCubicos: 1.4, precio: 63295.48 },
    { ciudad: "chaco", metrosCubicos: 1.6, precio: 63295.48 },
    { ciudad: "chaco", metrosCubicos: 1.8, precio: 63295.48 },
    { ciudad: "chaco", metrosCubicos: 2, precio: 63295.48 },
    { ciudad: "chaco", metrosCubicos: 0.25, precio: 13327.78 },    

    { ciudad: "entre rios", metrosCubicos: 0.02, precio: 10085.08 },
    { ciudad: "entre rios", metrosCubicos: 0.04, precio: 10085.08 },
    { ciudad: "entre rios", metrosCubicos: 0.08, precio: 10085.08 },
    { ciudad: "entre rios", metrosCubicos: 0.1, precio: 16384.78 },
    { ciudad: "entre rios", metrosCubicos: 0.2, precio: 2188.19 },
    { ciudad: "entre rios", metrosCubicos: 0.3, precio: 26631.93 },
    { ciudad: "entre rios", metrosCubicos: 0.4, precio: 26631.93 },
    { ciudad: "entre rios", metrosCubicos: 0.5, precio: 34541.04 },
    { ciudad: "entre rios", metrosCubicos: 0.6, precio: 34541.04 },
    { ciudad: "entre rios", metrosCubicos: 0.7, precio: 34541.04 },
    { ciudad: "entre rios", metrosCubicos: 0.8, precio: 34541.04 },
    { ciudad: "entre rios", metrosCubicos: 0.9, precio: 34541.04 },
    { ciudad: "entre rios", metrosCubicos: 1, precio: 49737.30 },
    { ciudad: "entre rios", metrosCubicos: 1.2, precio: 49737.30 },
    { ciudad: "entre rios", metrosCubicos: 1.4, precio: 49737.30 },
    { ciudad: "entre rios", metrosCubicos: 1.6, precio: 49737.30 },
    { ciudad: "entre rios", metrosCubicos: 1.8, precio: 49737.30 },
    { ciudad: "entre rios", metrosCubicos: 2, precio: 49737.30 },
    { ciudad: "entre rios", metrosCubicos: 0.25, precio: 10828.82 },    
    
    { ciudad: "corrientes", metrosCubicos: 0.02, precio: 12298.44 },
    { ciudad: "corrientes", metrosCubicos: 0.04, precio: 12298.44 },
    { ciudad: "corrientes", metrosCubicos: 0.08, precio: 12298.44 },
    { ciudad: "corrientes", metrosCubicos: 0.1, precio: 20851.48 },
    { ciudad: "corrientes", metrosCubicos: 0.2, precio: 27847.14 },
    { ciudad: "corrientes", metrosCubicos: 0.3, precio: 33890.33 },
    { ciudad: "corrientes", metrosCubicos: 0.4, precio: 33890.33 },
    { ciudad: "corrientes", metrosCubicos: 0.5, precio: 43956.85 },
    { ciudad: "corrientes", metrosCubicos: 0.6, precio: 43956.85 },
    { ciudad: "corrientes", metrosCubicos: 0.7, precio: 43956.85 },
    { ciudad: "corrientes", metrosCubicos: 0.8, precio: 43956.85 },
    { ciudad: "corrientes", metrosCubicos: 0.9, precio: 43956.85 },
    { ciudad: "corrientes", metrosCubicos: 1, precio: 63295.48 },
    { ciudad: "corrientes", metrosCubicos: 1.2, precio: 63295.48 },
    { ciudad: "corrientes", metrosCubicos: 1.4, precio: 63295.48 },
    { ciudad: "corrientes", metrosCubicos: 1.6, precio: 63295.48 },
    { ciudad: "corrientes", metrosCubicos: 1.8, precio: 63295.48 },
    { ciudad: "corrientes", metrosCubicos: 2, precio: 63295.48 },
    { ciudad: "corrientes", metrosCubicos: 0.25, precio: 13327.78 },    
    
];

// Función para formatear el precio
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(precio);
}

// Función para mostrar el spinner
function mostrarSpinner() {
    const spinner = document.createElement('div');
    spinner.className = 'spinner-border spinner-border2 text-primary';
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

function manejarCambio() {
    const provinciaElement = document.getElementById('nombre-provincia');
    const volumenElement = document.getElementById('volumenTotal');

    if (!provinciaElement || !volumenElement) {
        console.error("Elementos de provincia o volumen no encontrados.");
        return;
    }

    const provincia = provinciaElement.innerText.toLowerCase();
    const volumen = parseFloat(volumenElement.innerText);

    // Mostrar spinner si los inputs están vacíos
    mostrarSpinner();

    // Verificar si la provincia y el volumen son válidos
    if (!provincia || isNaN(volumen)) {
        // Mantener el spinner visible y no cambiar a "No disponible"
        return;
    }

    setTimeout(() => {
        buscarPrecio(provincia, volumen);
    }, 1000); // Retraso de 1 segundo
}


document.addEventListener('DOMContentLoaded', () => {
    manejarCambio();
});


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
