import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import Pricing from './pages/Pricing';
import { LanguageProvider } from './components/LanguageContext';
import Contact from './pages/Contact';
import MayaStory from './pages/MayaStory';
import PaymentCheckout from './pages/PaymentCheckout';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import Vision from './pages/Vision';
import Login from './pages/Login';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <Routes>
            <Route path="/" element={<LayoutWrapper currentPageName={mainPageKey}><MainPage /></LayoutWrapper>} />
            {Object.entries(Pages).map(([path, Page]) => (
              <Route key={path} path={`/${path}`} element={<LayoutWrapper currentPageName={path}><Page /></LayoutWrapper>} />
            ))}
            <Route path="/Pricing" element={<LayoutWrapper currentPageName="Pricing"><Pricing /></LayoutWrapper>} />
            <Route path="/Contact" element={<LayoutWrapper currentPageName="Contact"><Contact /></LayoutWrapper>} />
            <Route path="/MayaStory" element={<LayoutWrapper currentPageName="MayaStory"><MayaStory /></LayoutWrapper>} />
            <Route path="/PaymentCheckout" element={<LayoutWrapper currentPageName="PaymentCheckout"><PaymentCheckout /></LayoutWrapper>} />
            <Route path="/PaymentSuccess" element={<LayoutWrapper currentPageName="PaymentSuccess"><PaymentSuccess /></LayoutWrapper>} />
            <Route path="/PaymentCancel" element={<LayoutWrapper currentPageName="PaymentCancel"><PaymentCancel /></LayoutWrapper>} />
            <Route path="/Vision" element={<LayoutWrapper currentPageName="Vision"><Vision /></LayoutWrapper>} />
            <Route path="/Login" element={<Login />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App
