
import { useNavigate } from 'react-router-dom';
import CartPageComp from './../../components/Products/CartPageComp';


const CartPage = () => {
  const navigate = useNavigate()

  return (
    <main>
        <CartPageComp
          onCheckout={() => navigate('/checkout')}
          onContinueShopping={() => navigate('/productos')}
          onBack={() => navigate(-1)}
        />
    </main>
  )
}

export default CartPage