import { useLanguage } from './LanguageContext';

export default function PayPalButton() {
  const { lang } = useLanguage();
  const buttonText = lang === 'he' ? 'שלם עכשיו עם PayPal' : 'Pay with PayPal';

  return (
    <div className="flex justify-center">
      <form action="https://www.paypal.com/ncp/payment/Q84GCTNCHU63A" method="post" target="_blank" style={{display:'inline-grid', justifyItems:'center', alignContent:'start', gap:'0.5rem'}}>
        <input className="pp-Q84GCTNCHU63A" type="submit" value={buttonText} style={{textAlign:'center', border:'none', borderRadius:'0.25rem', minWidth:'11.625rem', padding:'0 2rem', height:'2.625rem', fontWeight:'bold', backgroundColor:'#FFD140', color:'#000', fontFamily:'\"Helvetica Neue\",Arial,sans-serif', fontSize:'1rem', lineHeight:'1.25rem', cursor:'pointer'}} />
        <img src="https://www.paypalobjects.com/images/Transparent.gif" alt="" width="1" height="1" />
      </form>
    </div>
  );
}