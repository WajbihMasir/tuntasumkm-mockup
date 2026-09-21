import { CheckCircle2, Truck } from 'lucide-react';
import { useStore } from '../../lib/store';
import { CITIES, quoteShipping } from '../../lib/workflowRules';
import { money } from '../../lib/demoData';

export const RequirementsForm = ({ value, onChange, prefix, owner = false }) => {
  const { products } = useStore(); const product = products.find(p => p.id === value.product);
  const change = (field, next) => onChange({ ...value, [field]: next });
  const shipping = quoteShipping(value); const subtotal = (product?.price || 0) * (Number(value.qty) || 0);
  return <div className="form-stack requirements-form">
    <label>Produk & varian<select data-testid={`${prefix}-product`} value={value.product} onChange={e => change('product', e.target.value)}>
      {!product && <option value={value.product}>Varian tidak ditemukan — pilih pengganti</option>}
      {products.map(p => <option key={p.id} value={p.id}>{`${p.name} · ${p.variant}`}</option>)}
    </select></label>
    <div className="requirement-product-note" data-testid={`${prefix}-product-info`}>{product ? `${product.variant} · Stok katalog: ${product.stock} pcs · ${money(product.price)}/pcs` : 'Varian yang diminta tidak ada dalam katalog.'}</div>
    <div className="form-grid"><label>Jumlah<input data-testid={`${prefix}-quantity`} type="number" min="1" max="99999" step="1" value={value.qty} onChange={e => change('qty', e.target.value)} /></label><label>Penerima<input data-testid={`${prefix}-recipient`} maxLength={80} value={value.name} onChange={e => change('name', e.target.value)} placeholder="Nama penerima" /></label></div>
    <label>Alamat lengkap<textarea data-testid={`${prefix}-address`} maxLength={250} rows="2" value={value.address} onChange={e => change('address', e.target.value)} placeholder="Jalan, nomor rumah, kecamatan" /></label>
    <div className="form-grid"><label>Kota tujuan<select data-testid={`${prefix}-city`} value={value.city} onChange={e => change('city', e.target.value)}><option value="">Pilih kota</option>{CITIES.map(city => <option key={city} value={city}>{city}</option>)}</select></label><label>Pengiriman<select data-testid={`${prefix}-service`} value={value.service} onChange={e => change('service', e.target.value)}><option value="reguler">Reguler · simulasi</option><option value="ekspres">Ekspres · simulasi</option><option value="manual" disabled={!owner}>Tarif pemilik · manual</option></select></label></div>
    {value.service === 'manual' && <div className="form-grid"><label>Ongkir manual (Rp)<input data-testid={`${prefix}-manual-shipping`} type="number" min="0" max="1000000" value={value.manualShipping} onChange={e => change('manualShipping', e.target.value)} disabled={!owner} /></label><label>Alasan tarif manual<input data-testid={`${prefix}-shipping-note`} maxLength={160} value={value.shippingNote} onChange={e => change('shippingNote', e.target.value)} disabled={!owner} /></label></div>}
    <label className="confirmation-check"><input type="checkbox" data-testid={`${prefix}-confirmed`} checked={!!value.confirmed} onChange={e => change('confirmed', e.target.checked)} /><span>Kebutuhan sudah dikonfirmasi pelanggan</span><CheckCircle2 size={15} /></label>
    <div className="quote-summary" data-testid={`${prefix}-quote`}><div><span>Subtotal produk</span><b>{money(subtotal)}</b></div><div><span><Truck size={13} />Ongkir simulasi</span><b>{shipping === null ? 'Belum tersedia' : money(shipping)}</b></div><div><span>Estimasi total</span><strong data-testid={`${prefix}-total`}>{shipping === null ? 'Belum lengkap' : money(subtotal + shipping)}</strong></div></div>
    <p className="simulation-footnote" data-testid={`${prefix}-shipping-disclaimer`}>Tarif demo: dasar kota + Rp4.000 per tambahan 2 pcs; ekspres + Rp12.000. Tidak ada layanan kurir yang dihubungi.</p>
  </div>;
};