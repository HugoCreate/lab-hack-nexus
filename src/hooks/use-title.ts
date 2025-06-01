import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

export function useTitle() {
    const brand = 'LabHack'
    const location = useLocation();
    const params = useParams();

    useEffect(() => {
        const titles = {
        '/': 'Home',
        '/post': 'Post',
        '/posts': 'Posts',
        '/category/*': 'Categoria',
        '/categories': 'Categorias',
        '/sobre': 'Sobre Nós',
        '/termos': 'Termos',
        '/privacidade': 'Privacidade'
    };

    if(titles[location.pathname]) {
        // document.title = brand + ' - ' + titles[location.pathname];
        document.title = titles[location.pathname]
    } else {
        for (const [path, name] of Object.entries(titles)) {
            const basePath = path.replace('*', '');

            let dynamic = location.pathname.replace(basePath, '');
            const words = dynamic.split('-');
            dynamic = words.map(word => 
                word.replace(word.charAt(0), word.charAt(0).toUpperCase())).join(' ')
            if (location.pathname.startsWith(basePath)) {
                document.title = name  
            }
            // else document.title = brand
        }
    }
    
    }, [location]);
}
