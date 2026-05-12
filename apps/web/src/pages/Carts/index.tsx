import { useLocation, useNavigate } from 'react-router-dom'
// @ts-expect-error legacy Amphitrite cart is copied as JS and bundled by Vite.
import Carts from '../../legacy/amphitrite/containers/Carts'

export const CartsPage = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const history = {
        push: (to: any) => {
            if (typeof to === 'string') {
                navigate(to)
                return
            }
            navigate({
                pathname: to.pathname || location.pathname,
                search: to.search || '',
            })
        },
        replace: (to: any) => {
            if (typeof to === 'string') {
                navigate(to, { replace: true })
                return
            }
            navigate(
                {
                    pathname: to.pathname || location.pathname,
                    search: to.search || '',
                },
                { replace: true }
            )
        },
        location,
    }

    return <Carts history={history} location={location} />
}

export default CartsPage
