"use client"

import { useEffect } from 'react'
import { devLog } from '@/lib/devLogger';
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Translation resources - simplified inline approach
const translations = {
  en: {
    common: {
      navigation: {
        dashboard: "Dashboard",
        profile: "Profile", 
        settings: "Settings",
        tools: "Tools",
        history: "History",
        pricing: "Pricing",
        signOut: "Sign Out",
        backToDashboard: "Back to Dashboard"
      },
      profile: {
        cosmicProfile: "Cosmic Profile",
        personalInformation: "Personal Information",
        editProfile: "Edit Profile",
        mysticalJourney: "Your mystical journey begins here"
      },
      settings: {
        managePreferences: "Manage your preferences, profile, and account",
        preferences: "Preferences"
      }
    }
  },
  hi: {
    common: {
      navigation: {
        dashboard: "डैशबोर्ड",
        profile: "प्रोफ़ाइल", 
        settings: "सेटिंग्स",
        tools: "उपकरण",
        history: "इतिहास",
        pricing: "मूल्य निर्धारण",
        signOut: "साइन आउट",
        backToDashboard: "डैशबोर्ड पर वापस जाएं"
      },
      profile: {
        cosmicProfile: "ब्रह्मांडीय प्रोफ़ाइल",
        personalInformation: "व्यक्तिगत जानकारी",
        editProfile: "प्रोफ़ाइल संपादित करें",
        mysticalJourney: "आपकी रहस्यमय यात्रा यहाँ से शुरू होती है"
      },
      settings: {
        managePreferences: "अपनी प्राथमिकताएं, प्रोफ़ाइल और खाता प्रबंधित करें",
        preferences: "प्राथमिकताएं"
      }
    }
  },
  es: {
    common: {
      navigation: {
        dashboard: "Panel",
        profile: "Perfil", 
        settings: "Configuración",
        tools: "Herramientas",
        history: "Historial",
        pricing: "Precios",
        signOut: "Cerrar Sesión",
        backToDashboard: "Volver al Panel"
      },
      profile: {
        cosmicProfile: "Perfil Cósmico",
        personalInformation: "Información Personal",
        editProfile: "Editar Perfil",
        mysticalJourney: "Tu viaje místico comienza aquí"
      },
      settings: {
        managePreferences: "Gestiona tus preferencias, perfil y cuenta",
        preferences: "Preferencias"
      }
    }
  },
  fr: {
    common: {
      navigation: {
        dashboard: "Tableau de Bord",
        profile: "Profil", 
        settings: "Paramètres",
        tools: "Outils",
        history: "Historique",
        pricing: "Tarifs",
        signOut: "Se Déconnecter",
        backToDashboard: "Retour au Tableau de Bord"
      },
      profile: {
        cosmicProfile: "Profil Cosmique",
        personalInformation: "Informations Personnelles",
        editProfile: "Modifier le Profil",
        mysticalJourney: "Votre voyage mystique commence ici"
      },
      settings: {
        managePreferences: "Gérez vos préférences, profil et compte",
        preferences: "Préférences"
      }
    }
  },
  zh: {
    common: {
      navigation: {
        dashboard: "仪表板",
        profile: "个人资料", 
        settings: "设置",
        tools: "工具",
        history: "历史",
        pricing: "价格",
        signOut: "退出登录",
        backToDashboard: "返回仪表板"
      },
      profile: {
        cosmicProfile: "宇宙档案",
        personalInformation: "个人信息",
        editProfile: "编辑个人资料",
        mysticalJourney: "您的神秘之旅从这里开始"
      },
      settings: {
        managePreferences: "管理您的偏好、个人资料和账户",
        preferences: "偏好设置"
      }
    }
  }
}

// Initialize i18n
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: translations,
      lng: 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false
      },
      defaultNS: 'common'
    })
}

interface I18nProviderProps {
  children: React.ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    const savedLanguage = localStorage.getItem('userSettings')
    if (savedLanguage) {
      try {
        const settings = JSON.parse(savedLanguage)
        if (settings.language && i18n.language !== settings.language) {
          i18n.changeLanguage(settings.language)
        }
      } catch (error) {
        devLog.error('Failed to load language setting:', error, 'I18nProvider')
      }
    }
  }, [])

  return <>{children}</>
}
