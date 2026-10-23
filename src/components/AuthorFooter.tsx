import { Heart, Mail, Phone } from 'lucide-react';
import './author-footer.css';

export default function AuthorFooter() {
  return (
    <footer className="author-footer" aria-label="Thông tin tác giả">
      <div className="author-footer__card">
        <div className="author-footer__identity">
          <span className="author-footer__copyright">✦ BẢN QUYỀN SỞ HỮU THUỘC VỀ</span>
          <p>Tác giả: <strong>Nguyễn Thị Nga</strong></p>
        </div>
        <a className="author-footer__contact author-footer__phone" href="tel:0349627607"><Phone aria-hidden="true" size={22} /><span><small>Số điện thoại</small><strong>0349627607</strong></span></a>
        <a className="author-footer__contact author-footer__email" href="mailto:Nguyennga.dp91@gmail.com"><Mail aria-hidden="true" size={22} /><span><small>Gmail</small><strong>Nguyennga.dp91@gmail.com</strong></span></a>
      </div>
      <p className="author-footer__tagline">Khu Vườn Tri Thức Mầm Non <span aria-hidden="true">·</span> Đồng hành cùng bé thơ &amp; cô giáo <Heart aria-hidden="true" size={15} /></p>
    </footer>
  );
}
