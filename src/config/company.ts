export interface FaqItem {
  question: string
  answer: string
}

export interface Persona {
  name: string
  role: string
  gender: "female" | "male"
  selfPronoun: string
  customerPronoun: string
  tone: string
  greeting: string
}

export interface VoiceConfig {
  languageCode: string
  name: string
  speed: number
  guidanceScale: number
}

/**
 * "mascot": robot Tripi từ file 3D public/avatars/vietravel-robot.glb.
 * "mascot-procedural": robot Tripi dựng bằng code, dự phòng khi không có file 3D.
 * "human": avatar người 3D dùng TalkingHead.
 */
export type AvatarModel = "mascot" | "mascot-procedural" | "human"

export interface CompanyConfig {
  brand: string
  avatarModel: AvatarModel
  legalName: string
  tagline: string
  description: string
  founded: number
  headquarters: string
  email: string
  hotline: string
  /** Cách đọc số tổng đài; chỉ dùng khi tạo giọng nói, chữ hiển thị vẫn là dạng số. */
  hotlineSpoken: string
  website: string
  /** Cách đọc website; chỉ dùng khi tạo giọng nói. */
  websiteSpoken: string
  licenseNumber: string
  logoUrl: string
  persona: Persona
  voice: VoiceConfig
  services: string[]
  tourLines: string[]
  paymentMethods: string[]
  promotions: string[]
  faqs: FaqItem[]
  suggestedQuestions: string[]
}

export const TOUR_TAG = "TOURS:"
export const MAX_RECOMMENDED_TOURS = 3

export const company: CompanyConfig = {
  brand: "Vietravel",
  avatarModel: "mascot",
  legalName: "Công ty Cổ phần Du lịch Vietravel",
  tagline: "Nâng tầm giá trị cuộc sống",
  description:
    "Vietravel là công ty lữ hành tổ chức tour trọn gói trong nước và nước ngoài, đồng thời cung cấp vé máy bay, khách sạn, combo du lịch và các dịch vụ cộng thêm.",
  founded: 1995,
  headquarters: "190 Pasteur, Phường Xuân Hoà, TP. Hồ Chí Minh",
  email: "info@vietravel.com",
  hotline: "1800 646 888",
  hotlineSpoken: "một tám không không, sáu bốn sáu, tám tám tám",
  website: "travel.com.vn",
  websiteSpoken: "travel chấm com chấm v n",
  licenseNumber: "79-234/2022/TCDL-GP LHQT",
  logoUrl: "https://s3-cmc.travel.com.vn/static/web-travel/logo/vietravel-logo.png",
  persona: {
    name: "Tripi",
    role: "trợ lý du lịch",
    gender: "female",
    selfPronoun: "em",
    customerPronoun: "Quý khách",
    tone: "thân thiện, nhiệt tình, chuyên nghiệp như một tư vấn viên lữ hành giàu kinh nghiệm",
    greeting:
      "Xin chào Quý khách, em là Tripi, trợ lý du lịch của Vietravel. Quý khách đang muốn đi đâu, khởi hành từ thành phố nào và dự kiến đi vào thời gian nào để em tìm tour phù hợp ạ?",
  },
  voice: {
    languageCode: "vi-VN",
    name: "vi-ngoc-huyen-2-0",
    speed: 1,
    guidanceScale: 2.8,
  },
  services: [
    "Tour trọn gói trong nước và nước ngoài",
    "Vé máy bay",
    "Khách sạn",
    "Combo du lịch vé máy bay và khách sạn",
    "Dịch vụ cộng thêm như vé tham quan, eSIM du lịch, thuê xe",
    "Vietravel MICE cho đoàn doanh nghiệp, hội nghị, sự kiện",
    "Chương trình khách hàng thân thiết Vietravel Loyalty",
    "Khảo sát tỷ lệ đạt visa trên website",
  ],
  tourLines: ["Cao cấp", "Tiêu chuẩn", "Tiết kiệm", "Giá tốt"],
  paymentMethods: ["thẻ Visa", "Mastercard", "JCB", "American Express", "VNPay", "ZaloPay", "Momo"],
  promotions: [
    "Ưu đãi giờ chót cho các tour sắp khởi hành, giảm trực tiếp trên giá tour",
    "Ưu đãi giờ vàng, tức flash sale, số lượng chỗ có hạn",
    "Ưu đãi đặt online, Quý khách đăng nhập tài khoản trên website để được áp dụng",
    "Giảm giá theo nhóm khách",
  ],
  faqs: [
    {
      question: "Đặt tour bằng cách nào?",
      answer:
        "Quý khách đặt trực tiếp trên website travel.com.vn, gọi tổng đài miễn phí 1800 646 888 hoạt động 24/7, hoặc đến văn phòng Vietravel tại 190 Pasteur, TP. Hồ Chí Minh.",
    },
    {
      question: "Giá tour có thay đổi không?",
      answer:
        "Giá và số chỗ thay đổi theo ngày khởi hành và chương trình ưu đãi, giá chính xác được xác nhận khi đặt tour trên website hoặc qua tổng đài.",
    },
    {
      question: "Có tra cứu được booking không?",
      answer: "Quý khách tra cứu booking ngay trên website travel.com.vn bằng mục Tra cứu booking.",
    },
    {
      question: "Vietravel có giấy phép lữ hành quốc tế không?",
      answer: "Có, giấy phép kinh doanh lữ hành quốc tế số 79-234/2022/TCDL-GP LHQT.",
    },
  ],
  suggestedQuestions: [
    "Tháng này đi Đà Nẵng Hội An 3 ngày hết bao nhiêu?",
    "Có tour Nhật Bản ngắm mùa thu không em?",
    "Tour nước ngoài nào dưới 10 triệu?",
    "Đang có ưu đãi giờ chót nào không?",
    "Thanh toán bằng những hình thức nào?",
  ],
}
