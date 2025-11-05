import React, { FunctionComponent, useContext } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ThemeOptions } from '@mui/material/styles/createTheme';
import { UserContext, UserContextType } from '../utils/hooks/useAuth';
import themeDark from './ThemeDark';
import themeLight from './ThemeLight';
import { useDocumentFaviconModifier, useDocumentThemeModifier } from '../utils/hooks/useDocumentModifier';
import { AppThemeProvider_settings$data } from './__generated__/AppThemeProvider_settings.graphql';
import RtlProvider from './RtlProvider';
import locale from '../utils/BrowserLanguage';

type PlatformLang =
  | 'de-de'
  | 'en-us'
  | 'es-es'
  | 'fr-fr'
  | 'it-it'
  | 'ja-jp'
  | 'ko-kr'
  | 'zh-cn'
  | 'ru-ru'
  | 'fa-IR';

interface AppThemeProviderProps {
  children: React.ReactNode;
  settings: AppThemeProvider_settings$data;
}

const themeBuilder = (
  settings: AppThemeProvider_settings$data,
  themeColor: string,
) => {
  if (themeColor === 'light') {
    const platformThemeLightLogo = settings?.platform_theme_light_logo ?? null;
    const platformThemeLightLogoCollapsed = settings?.platform_theme_light_logo_collapsed ?? null;
    const platformThemeLightBackground = settings?.platform_theme_light_background ?? null;
    const platformThemeLightPaper = settings?.platform_theme_light_paper ?? null;
    const platformThemeLightNav = settings?.platform_theme_light_nav ?? null;
    const platformThemeLightPrimary = settings?.platform_theme_light_primary ?? null;
    const platformThemeLightSecondary = settings?.platform_theme_light_secondary ?? null;
    const platformThemeLightAccent = settings?.platform_theme_light_accent ?? null;
    return themeLight(
      platformThemeLightLogo,
      platformThemeLightLogoCollapsed,
      platformThemeLightBackground,
      platformThemeLightPaper,
      platformThemeLightNav,
      platformThemeLightPrimary,
      platformThemeLightSecondary,
      platformThemeLightAccent,
    );
  }
  const platformThemeDarkLogo = settings?.platform_theme_dark_logo ?? null;
  const platformThemeDarkLogoCollapsed = settings?.platform_theme_dark_logo_collapsed ?? null;
  const platformThemeDarkBackground = settings?.platform_theme_dark_background ?? null;
  const platformThemeDarkPaper = settings?.platform_theme_dark_paper ?? null;
  const platformThemeDarkNav = settings?.platform_theme_dark_nav ?? null;
  const platformThemeDarkPrimary = settings?.platform_theme_dark_primary ?? null;
  const platformThemeDarkSecondary = settings?.platform_theme_dark_secondary ?? null;
  const platformThemeDarkAccent = settings?.platform_theme_dark_accent ?? null;
  return themeDark(
    platformThemeDarkLogo,
    platformThemeDarkLogoCollapsed,
    platformThemeDarkBackground,
    platformThemeDarkPaper,
    platformThemeDarkNav,
    platformThemeDarkPrimary,
    platformThemeDarkSecondary,
    platformThemeDarkAccent,
  );
};

const AppThemeProvider: FunctionComponent<AppThemeProviderProps> = ({
  children,
  settings,
}) => {
  const { me, settings: contextSettings } = useContext<UserContextType>(UserContext);
  useDocumentFaviconModifier(settings?.platform_favicon);
  
  // Calculate language (same logic as AppIntlProvider)
  // Try to get platform_language from settings prop first (from fragment),
  // then fall back to contextSettings if available
  const platformLanguage = (settings as any)?.platform_language ?? contextSettings?.platform_language ?? null;
  const platformLang = platformLanguage !== null && platformLanguage !== 'auto' ? platformLanguage : locale;
  const lang: PlatformLang = me?.language && me.language !== 'auto' ? (me.language as PlatformLang) : (platformLang as PlatformLang);
  
  // Determine direction based on language: RTL for Persian (fa-IR), LTR for others
  // Normalize language code for comparison (handle case variations)
  const normalizedLang = lang?.toLowerCase();
  const isRtl = normalizedLang === 'fa-ir' || normalizedLang === 'fa_ir';
  const direction = isRtl ? 'rtl' : 'ltr';
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[AppThemeProvider] Language:', lang, 'normalized:', normalizedLang, 'isRtl:', isRtl, 'direction:', direction);
    console.log('[AppThemeProvider] platformLanguage:', platformLanguage, 'me.language:', me?.language);
  }
  
  // region theming
  const defaultTheme = settings?.platform_theme ?? null;
  const platformTheme = defaultTheme !== null && defaultTheme !== 'auto' ? defaultTheme : 'dark';
  const theme = me?.theme && me.theme !== 'default' ? me.theme : platformTheme;
  const themeComponent = themeBuilder(settings, theme);
  const muiTheme = createTheme({ ...(themeComponent as ThemeOptions), direction });
  useDocumentThemeModifier(theme);
  // endregion
  
  return (
    <ThemeProvider theme={muiTheme}>
      <RtlProvider isRtl={isRtl}>
        {children}
      </RtlProvider>
    </ThemeProvider>
  );
};

export const ConnectedThemeProvider = createFragmentContainer(
  AppThemeProvider,
  {
    settings: graphql`
      fragment AppThemeProvider_settings on ThemeSettings {
        platform_title
        platform_favicon
        platform_theme
        ... on IntlSettings {
          platform_language
        }
        platform_theme_dark_background
        platform_theme_dark_paper
        platform_theme_dark_nav
        platform_theme_dark_primary
        platform_theme_dark_secondary
        platform_theme_dark_accent
        platform_theme_dark_logo
        platform_theme_dark_logo_collapsed
        platform_theme_light_background
        platform_theme_light_paper
        platform_theme_light_nav
        platform_theme_light_primary
        platform_theme_light_secondary
        platform_theme_light_accent
        platform_theme_light_logo
        platform_theme_light_logo_collapsed
      }
    `,
  },
);

export default AppThemeProvider;
