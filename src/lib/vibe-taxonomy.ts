/**
 * Phân loại cảm xúc, phong cách du lịch và không khí (Vibe & Emotion Taxonomy)
 * Dùng để tìm tour theo cảm xúc khi khách không nêu điểm đến, ngày hay ngân sách.
 */

export interface VibeCategory {
  id: string
  name: string
  keywords: string[]
  destinations: string[]
}

export const VIBE_CATEGORIES: VibeCategory[] = [
  {
    id: "healing_peace",
    name: "Chữa lành & Yên bình (Healing & Peaceful)",
    keywords: [
      "chữa lành", "yên bình", "thư giãn", "xả stress", "tĩnh lặng", "bình yên", "trốn phố",
      "thư thái", "an yên", "reset bản thân", "thiền", "nghỉ ngơi", "không ồn ào", "tươi mát"
    ],
    destinations: ["Đà Lạt", "Yên Tử", "Ninh Bình", "Tràng An", "Hà Giang", "Pù Luông", "Côn Đảo", "Huế", "Mai Châu", "Mộc Châu", "Sapa", "Ba Bể"],
  },
  {
    id: "romantic_honeymoon",
    name: "Lãng mạn & Trăng mật (Romantic & Couple)",
    keywords: [
      "lãng mạn", "trăng mật", "honeymoon", "cặp đôi", "ngọt ngào", "tình nhân", "kỷ niệm ngày cưới",
      "hẹn hò", "hoàng hôn", "ấm cúng", "sang trọng"
    ],
    destinations: ["Đà Lạt", "Phú Quốc", "Bà Nà Hills", "Hội An", "Nha Trang", "Paris", "Venice", "Maldives", "Jeju", "Santorini", "Đà Nẵng"],
  },
  {
    id: "mist_mountain_cool",
    name: "Se lạnh & Săn mây (Cool & Mountain Mist)",
    keywords: [
      "se lạnh", "lạnh", "săn mây", "sương mù", "núi rừng", "đồi thông", "núi cao", "đỉnh núi",
      "không khí trong lành", "mùa đông", "áo ấm", "cao nguyên"
    ],
    destinations: ["Sapa", "Fansipan", "Đà Lạt", "Hà Giang", "Mộc Châu", "Bà Nà", "Tây Bắc", "Bảo Lộc", "Bạch Mộc Lương Tử", "Tam Đảo"],
  },
  {
    id: "beach_sunshine",
    name: "Biển xanh & Nắng vàng (Tropical Beach)",
    keywords: [
      "biển", "biển xanh", "nắng vàng", "tắm biển", "hải sản", "lặn ngắm san hô", "đảo",
      "resort", "nghỉ dưỡng biển", "nhiệt đới", "sóng biển", "bờ cát"
    ],
    destinations: ["Phú Quốc", "Nha Trang", "Quy Nhơn", "Phan Thiết", "Mũi Né", "Đà Nẵng", "Côn Đảo", "Vũng Tàu", "Phuket", "Bali", "Pattaya"],
  },
  {
    id: "culture_heritage",
    name: "Văn hoá & Di sản (Heritage & Culture)",
    keywords: [
      "văn hoá", "lịch sử", "di sản", "cổ kính", "phố cổ", "truyền thống", "bảo tàng", "di tích",
      "kiến trúc xưa", "hoài niệm", "lăng tẩm", "cố đô", "làng nghề"
    ],
    destinations: ["Hội An", "Huế", "Hà Nội", "Ninh Bình", "Côn Đảo", "Đền Hùng", "Angkor Wat", "Kyoto", "Bắc Kinh", "Xiêm Riệp", "Luang Prabang"],
  },
  {
    id: "spiritual_pilgrimage",
    name: "Tâm linh & Chiêm bái (Spiritual & Pilgrimage)",
    keywords: [
      "tâm linh", "chùa chiền", "chiêm bái", "cầu an", "cầu phúc", "đền đài", "thánh địa",
      "hành hương", "linh thiêng", "tượng phật", "chùa bái đính", "yên tử"
    ],
    destinations: ["Yên Tử", "Bái Đính", "Chùa Hương", "Tây Thiên", "Côn Đảo", "Chùa Tam Chúc", "Chùa Bà Tây Ninh", "Chùa Vàng", "Ấn Độ", "Tây Tạng", "Myanmar"],
  },
  {
    id: "modern_shopping_checkin",
    name: "Hiện đại & Sống ảo (Modern, Shopping & Check-in)",
    keywords: [
      "sống ảo", "check-in", "hiện đại", "mua sắm", "shopping", "sôi động", "nhộn nhịp",
      "thành phố lớn", "trung tâm thương mại", "ẩm thực đường phố", "vui chơi giải trí", "công viên chủ đề"
    ],
    destinations: ["Bangkok", "Singapore", "Tokyo", "Seoul", "Thượng Hải", "Hồng Kông", "Dubai", "Kuala Lumpur", "Bà Nà Hills", "VinWonders"],
  },
  {
    id: "family_cruise_relax",
    name: "Gia đình & Du thuyền (Family & Cruise Relax)",
    keywords: [
      "gia đình", "người lớn tuổi", "trẻ nhỏ", "nhẹ nhàng", "du thuyền", "tiện nghi",
      "không leo trèo", "nghỉ dưỡng", "trọn gói", "cao cấp", "ẩm thực phong phú"
    ],
    destinations: ["Hạ Long", "Lan Hạ", "Đà Nẵng", "Phú Quốc", "Nha Trang", "Singapore Cruise", "Bangkok"],
  },
  {
    id: "autumn_foliage_snow",
    name: "Mùa thu lá đỏ & Tuyết trắng (Autumn & Winter Wonder)",
    keywords: [
      "mùa thu", "lá vàng", "lá đỏ", "ngắm tuyết", "tuyết trắng", "mùa đông", "hoa tam giác mạch",
      "mùa lúa chín", "cảnh sắc bốn mùa", "rực rỡ"
    ],
    destinations: ["Hà Giang", "Mù Cang Chải", "Hàn Quốc", "Nhật Bản", "Châu Âu", "Bắc Kinh", "Cửu Trại Câu", "Sapa", "Trương Gia Giới"],
  }
]
