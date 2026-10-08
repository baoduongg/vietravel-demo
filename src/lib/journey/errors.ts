/** Lỗi có mã HTTP và thông báo tiếng Việt hiển thị thẳng cho người dùng. */
export class JourneyError extends Error {
  constructor(
    readonly status: 400 | 403 | 404,
    message: string,
  ) {
    super(message)
    this.name = "JourneyError"
  }
}
