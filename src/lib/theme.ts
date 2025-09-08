// src/lib/theme.ts
export interface NavItem {
  name: string;
  href: string;
  newTab?: boolean;
}

export interface ThemeConfig {
  branding: {
    name: string;
    logo: {
      text: string;
      image: {
        src: string;
        alt: string;
        width: number;
        height: number;
      };
    };
  };
  navigation: {
    items: NavItem[];
  };
  buttons: {
    search: {
      text: string;
      ariaLabel: string;
    };
    auth: {
      signIn: string;
      signUp: string;
      goToApp: string;
    };
  };
}

export const themeConfig: ThemeConfig = {
  branding: {
    name: "consuelo",
    logo: {
      text: "consuelo",
      image: {
        src: "/apple-touch-icon.png",
        alt: "Consuelo Logo",
        width: 40,
        height: 40,
      },
    },
  },
  navigation: {
    items: [
      { name: "Zara", href: "/zara" },
      { name: "Mercury", href: "/mercury" },
      { name: "Pricing", href: "/pricing" },
      { name: "Use Cases", href: "/use-cases" },
      { name: "Stories", href: "/stories" },
      { name: "Investors", href: "/investors" },
    ],
  },
  buttons: {
    search: {
      text: "Search",
      ariaLabel: "Search",
    },
    auth: {
      signIn: "Sign In",
      signUp: "Sign Up",
      goToApp: "Go to App",
    },
  },
};