import { PropsWithChildren, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from './store';
import {
    toggleRTL,
    toggleTheme,
    toggleLocale,
    toggleMenu,
    toggleLayout,
    toggleAnimation,
    toggleNavbar,
    toggleSemidark,
} from './store/themeConfigSlice';

function App({ children }: PropsWithChildren) {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const dispatch = useDispatch();
    const { i18n } = useTranslation();

    useEffect(() => {
        // Recuperar valores do localStorage
        const storedTheme = localStorage.getItem('theme') || themeConfig.theme;
        const storedLayout = localStorage.getItem('layout') || themeConfig.layout;
        const storedRTLClass = localStorage.getItem('rtlClass') || themeConfig.rtlClass;
        const storedAnimation = localStorage.getItem('animation') || themeConfig.animation;
        const storedNavbar = localStorage.getItem('navbar') || themeConfig.navbar;
        const storedSemidark = localStorage.getItem('semidark') || themeConfig.semidark;

        // Disparar as ações
        dispatch(toggleTheme(storedTheme));
        dispatch(toggleMenu('horizontal')); // Considerar tornar isso dinâmico se necessário
        dispatch(toggleLayout(storedLayout));
        dispatch(toggleRTL(storedRTLClass));
        dispatch(toggleAnimation(storedAnimation));
        dispatch(toggleNavbar(storedNavbar));
        dispatch(toggleSemidark(storedSemidark));

        // Locale
        const locale = localStorage.getItem('i18nextLng') || themeConfig.locale;
        dispatch(toggleLocale(locale));
        i18n.changeLanguage(locale);
    }, [dispatch, themeConfig]);

    return (
        <div
            className={`${themeConfig.sidebar ? 'toggle-sidebar' : ''} ${themeConfig.menu} ${themeConfig.layout} ${
                themeConfig.rtlClass
            } main-section relative font-nunito text-sm font-normal antialiased`}
        >
            {children}
        </div>
    );
}

export default App;
