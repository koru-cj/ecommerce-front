import { useEffect, useState } from 'react';
import { getPublicProducts, getPublicCategories } from '../lib/apiClient';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import Logo from '../components/Logo';
import Loader from '../components/Loader';
import './styles/Home.css';
import { useOutletContext } from 'react-router-dom';
export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyDiscounts, setOnlyDiscounts] = useState(false);
  const [selectedVisibility, setSelectedVisibility] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [onlyOrganic, setOnlyOrganic] = useState(false);
  const [onlySenasa, setOnlySenasa] = useState(false);
  
  const [rawMinPrice, setRawMinPrice] = useState('');
  const [rawMaxPrice, setRawMaxPrice] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isBlocked, setIsBlocked] = useState(false);
  const [filterChangeCount, setFilterChangeCount] = useState(0);
  const { searchQuery, setSearchQuery } = useOutletContext();
  const perPage = 8;

  useEffect(() => {
    async function loadData() {
      try {
        const [prods, cats] = await Promise.all([
          getPublicProducts(),
          getPublicCategories()
        ]);
        setProducts(prods);
        setCategories(cats);
      } catch (err) {
        console.error('Error cargando productos/categorías:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (isBlocked) return;
    setFilterChangeCount(prev => prev + 1);
  }, [rawMinPrice, rawMaxPrice]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMinPrice(rawMinPrice);
      setMaxPrice(rawMaxPrice);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [rawMinPrice, rawMaxPrice]);

  useEffect(() => {
    if (filterChangeCount > 40) {
      setIsBlocked(true);
      setTimeout(() => {
        setIsBlocked(false);
        setFilterChangeCount(0);
      }, 10000);
    }
  }, [filterChangeCount]);

  if (loading) return <Loader />;
  if (error) return <p style={{ padding: 20 }}>Error: {error.message}</p>;

  const filtered = products.filter(p => {
    const matchesName = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory
      ? p.category?.toLowerCase() === selectedCategory.toLowerCase()
      : true;
    const matchesStock = onlyInStock ? p.stock > 0 : true;
    const now = new Date();
    const matchesDiscount = onlyDiscounts
      ? p.discount_percentage > 0 && (!p.discount_expiration || new Date(p.discount_expiration) > now)
      : true;

    const matchesVisibility = selectedVisibility === 'visible' ? p.visible === true
      : selectedVisibility === 'hidden' ? p.visible === false
      : true;
    const matchesBrand = selectedBrand ? p.brand === selectedBrand : true;
    const matchesOrganic = onlyOrganic ? p.organic === true : true;
    const matchesSenasa = onlySenasa ? p.senasa === true : true;
    const matchesMinPrice = minPrice ? p.price >= parseFloat(minPrice) : true;
    const matchesMaxPrice = maxPrice ? p.price <= parseFloat(maxPrice) : true;

    return matchesName && matchesCategory && matchesStock && matchesDiscount &&
      matchesVisibility && matchesBrand && matchesOrganic && matchesSenasa &&
      matchesMinPrice && matchesMaxPrice;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const start = (currentPage - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);
  localStorage.getItem('token')  // o 'accessToken', 'jwt', etc.
  sessionStorage.getItem('token')


  return (
    <>


      <div className="container layout">
          <Sidebar
            categories={categories}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            minPrice={rawMinPrice}
            maxPrice={rawMaxPrice}
            onMinPriceChange={(value) => !isBlocked && setRawMinPrice(value)}
            onMaxPriceChange={(value) => !isBlocked && setRawMaxPrice(value)}
            onlyInStock={onlyInStock}
            onToggleInStock={() => setOnlyInStock(prev => !prev)}
            onlyDiscounts={onlyDiscounts}
            onToggleWithDiscounts={() => setOnlyDiscounts(prev => !prev)}
            selectedVisibility={selectedVisibility}
            onVisibilityChange={setSelectedVisibility}
            brands={[...new Set(products.map(p => p.brand).filter(Boolean))]}
            selectedBrand={selectedBrand}
            onBrandSelect={setSelectedBrand}
            onlyOrganic={onlyOrganic}
            onToggleOrganic={() => setOnlyOrganic(prev => !prev)}
            onlySenasa={onlySenasa}
            onToggleSenasa={() => setOnlySenasa(prev => !prev)}
            isBlocked={isBlocked}
          />

        <main>
          <div className='tituloProducts'>
            <h2 style={{ marginBottom: '1rem' }}>
              {selectedCategory ? `Categoría: ${selectedCategory}` : 'Todos los productos'}
            </h2>
            
            <SearchBar value={searchQuery} onSearch={setSearchQuery} />

          </div>
          <div className="product-grid">
            {pageItems.length === 0 ? (
              <p style={{ padding: '1rem', fontSize: '1.1rem', color: '#777' }}>
                No se encontraron productos que coincidan con tu búsqueda.
              </p>
            ) : (
              pageItems.map(p => (
                <ProductCard key={p.id} product={p} />
              ))
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </main>
      </div>
    </>
  );
}