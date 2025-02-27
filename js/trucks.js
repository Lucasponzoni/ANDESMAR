const range1000to1500 = Array.from({ length: 501 }, (_, i) => 1000 + i);

const andesmarCPs = range1000to1500.concat([
  1602, 1603, 1605, 1606, 1607, 1609, 1611, 1612, 1613, 1614, 1615, 1617, 1618, 1619, 
  1620, 1621, 1623, 1625, 1627, 1629, 1631, 1633, 1635, 1636, 1638, 1640, 1641, 1642, 
  1643, 1644, 1646, 1648, 1650, 1651, 1653, 1655, 1657, 1659, 1661, 1663, 1664, 1665, 
  1667, 1669, 1671, 1672, 1674, 1676, 1678, 1682, 1684, 1686, 1688, 1702, 1704, 1706, 
  1708, 1712, 1713, 1714, 1716, 1718, 1722, 1723, 1742, 1744, 1746, 1748, 1752, 1754, 
  1755, 1757, 1759, 1763, 1765, 1766, 1768, 1770, 1771, 1772, 1773, 1774, 1776, 1778, 
  1802, 1804, 1805, 1806, 1812, 1822, 1824, 1825, 1826, 1828, 1832, 1834, 1835, 1836, 
  1838, 1842, 1846, 1852, 1854, 1856, 1870, 1871, 1872, 1874, 1875, 1876, 1878, 1879, 
  1882, 1884, 1885, 1886, 1888, 1889, 1890, 1891, 1894, 1895, 1896, 1897, 1900, 1901, 
  1923, 1925, 8000, 5000, 5001, 5002, 5003, 5004, 5006, 5008, 5009, 5010, 5011, 5012, 
  5013, 5014, 5016, 5017, 5018, 5019, 5020, 5021, 5022, 5023, 5500, 5501, 5503, 5505, 
  5507, 5509, 5511, 5513, 5515, 5517, 5519, 5521, 5523, 5525, 5527, 5529, 5531, 5533, 
  5535, 5537, 5539, 5541, 5543, 5544, 5545, 5547, 5549, 5551, 5560, 5561, 5563, 5565, 
  5567, 5569, 5570, 5571, 5572, 5573, 5575, 5577, 5579, 5582, 5584, 5585, 5587, 5589, 
  5590, 5591, 5592, 5594, 5595, 5596, 5598, 5600, 5601, 5603, 5605, 5607, 5609, 5611, 
  5612, 5613, 5615, 5620, 5621, 5622, 5623, 5624, 5632, 5634, 5636, 5637, 3500, 3100, 
  3400
]);

document.getElementById('codigoPostalDestinatario').addEventListener('input', function() {
    const codigoPostal = this.value;
    const andesmarTruck = document.getElementById('truckAndesmar');
    const andreaniTruck = document.getElementById('truckAndreani');

    // Restablecer estilos al cambiar el valor del input
    andesmarTruck.querySelector('img').classList.remove('envio-verde', 'desactivado');
    andesmarTruck.querySelector('.label').classList.remove('envio-verde', 'titilando');
    andreaniTruck.querySelector('img').classList.remove('envio-verde', 'desactivado');
    andreaniTruck.querySelector('.label').classList.remove('envio-verde', 'titilando');

    // Si el campo está vacío, no hacer nada más
    if (codigoPostal.length < 4) {
        andesmarTruck.querySelector('.label').textContent = 'ANDESMAR'; // Restablecer texto si es necesario
        andreaniTruck.querySelector('.label').textContent = 'ANDREANI'; // Restablecer texto si es necesario
        return;
    }

    // Verifica que el código postal tenga 4 caracteres
    if (codigoPostal.length === 4) {
        // Convertir a número
        const codigoPostalNum = parseInt(codigoPostal);

        if (andesmarCPs.includes(codigoPostalNum)) {
            andesmarTruck.querySelector('img').classList.add('envio-verde');
            andesmarTruck.querySelector('.label').textContent = 'ENVIO ANDESMAR';
            andesmarTruck.querySelector('.label').classList.add('envio-verde', 'titilando');
            andreaniTruck.querySelector('img').classList.add('desactivado'); // Desactivar imagen de Andreani
            andreaniTruck.querySelector('.label').classList.add('desactivado'); // Desactivar etiqueta de Andreani
        } else {
            andreaniTruck.querySelector('img').classList.add('envio-verde');
            andreaniTruck.querySelector('.label').textContent = 'ENVIO ANDREANI';
            andreaniTruck.querySelector('.label').classList.add('envio-verde', 'titilando');
            andesmarTruck.querySelector('img').classList.add('desactivado'); // Desactivar imagen de Andesmar
            andesmarTruck.querySelector('.label').classList.add('desactivado'); // Desactivar etiqueta de Andesmar
        }
    }
});


