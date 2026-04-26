import { TbVinyl } from "react-icons/tb";
import { FaFacebook, FaTiktok, FaInstagram } from "react-icons/fa";

export default function Footer() {
  
  return (
    <footer className="mt-20 pt-10 border-t border-white/10 pb-10">
      
      <div className="flex justify-between items-start mb-12">
        {/* Left: Company Info */}
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-nct-primary rounded-full flex items-center justify-center">
               <TbVinyl className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold leading-tight tracking-widest">NCT</span>
              <span className="text-[10px] text-nct-text-dim uppercase tracking-wider">nhaccuatui®</span>
            </div>
          </div>
          
          <h4 className="font-bold text-lg">CÔNG TY CỔ PHẦN NCT</h4>
          <ul className="text-sm text-nct-text-dim space-y-1.5 leading-relaxed">
            <li>• Giấy phép cung cấp dịch vụ mạng xã hội số 140/GP-BTTTT do Bộ Thông tin và Truyền thông cấp ngày 14/10/2025.</li>
            <li>• Giấy Chứng nhận Đăng ký Kinh doanh số 0305535715 do Sở kế hoạch và Đầu tư thành phố Hồ Chí Minh cấp ngày 01/03/2008.</li>
            <li>• Nhân sự chịu trách nhiệm quản lý nội dung thông tin: Ông Phan Hoài Nam</li>
            <li>• Địa chỉ: Tầng 19, Tòa nhà 678, 67 Hoàng Văn Thái, Phường Tân Phú, Quận 7, TP. Hồ Chí Minh</li>
            <li>• Email: <a href="mailto:support@nct.vn" className="hover:text-nct-primary hover:underline">support@nct.vn</a></li>
            <li>• Số điện thoại: (028) 3868 7979</li>
          </ul>
        </div>

        {/* Right: Apps, Socials, Badges */}
        <div className="flex flex-col items-end gap-6">
          <div className="flex gap-4">
            <div className="bg-blue-600 rounded px-2 py-1 flex flex-col items-center justify-center text-[8px] font-bold">
              <span>ĐÃ THÔNG BÁO</span>
              <span>BỘ CÔNG THƯƠNG</span>
            </div>
            <div className="border border-green-500 text-green-500 rounded px-2 py-1 text-[10px] font-bold flex items-center">
              DMCA PROTECTED
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            {/* App Store */}
            <button className="flex items-center gap-2 bg-black border border-white/20 rounded-lg px-3 py-1.5 hover:bg-white/5 transition-colors">
              <div className="text-xl">🍏</div>
              <div className="flex flex-col items-start">
                <span className="text-[8px] leading-none">Download on the</span>
                <span className="text-xs font-bold leading-none">App Store</span>
              </div>
            </button>
            {/* Google Play */}
            <button className="flex items-center gap-2 bg-black border border-white/20 rounded-lg px-3 py-1.5 hover:bg-white/5 transition-colors">
              <div className="text-xl">▶️</div>
              <div className="flex flex-col items-start">
                <span className="text-[8px] leading-none">GET IT ON</span>
                <span className="text-xs font-bold leading-none">Google Play</span>
              </div>
            </button>
            {/* AppGallery */}
            <button className="flex items-center gap-2 bg-black border border-white/20 rounded-lg px-3 py-1.5 hover:bg-white/5 transition-colors">
              <div className="text-xl text-red-600">🌺</div>
              <div className="flex flex-col items-start">
                <span className="text-[8px] leading-none">EXPLORE IT ON</span>
                <span className="text-xs font-bold leading-none">AppGallery</span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm text-nct-text-dim">Find us on</span>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center hover:scale-110 transition-transform">
                <FaFacebook className="w-4 h-4 text-white" />
              </button>
              <button className="w-8 h-8 rounded-full bg-black border border-white/20 flex items-center justify-center hover:scale-110 transition-transform">
                <FaTiktok className="w-4 h-4 text-white" />
              </button>
              <button className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center hover:scale-110 transition-transform">
                <FaInstagram className="w-4 h-4 text-white" />
              </button>
              <button className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-[10px] text-white hover:scale-110 transition-transform">
                Zalo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10 text-xs text-nct-text-dim">
        <div className="flex gap-6">
          <a href="#" className="hover:text-nct-primary transition-colors">Chính Sách Bảo Mật</a>
          <span className="text-white/20">•</span>
          <a href="#" className="hover:text-nct-primary transition-colors">Chính Sách SHTT</a>
          <span className="text-white/20">•</span>
          <a href="#" className="hover:text-nct-primary transition-colors">Thỏa Thuận Sử Dụng</a>
        </div>
        <div>
          © NCT Corp. All rights reserved
        </div>
      </div>
    </footer>
  );
}
