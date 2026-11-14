import { ArrowUpRight, Wifi, Laptop, ShieldCheck, Monitor } from 'lucide-react';
const icons = { network: Wifi, computer: Laptop, security: ShieldCheck, setup: Monitor };
export default function ServiceCard({ service, onSelect }) {
  const Icon = icons[service.slug] || Monitor;
  return <article className="service-card"><div className="service-top"><span className="icon-box"><Icon size={24}/></span><span className="tag">{service.category}</span></div><h3>{service.name}</h3><p>{service.description}</p><div className="service-bottom"><span><strong>${service.price}</strong> <small>/ {service.duration} min</small></span><button className="icon-button" aria-label={`Book ${service.name}`} onClick={() => onSelect(service)}><ArrowUpRight size={21}/></button></div></article>;
}
