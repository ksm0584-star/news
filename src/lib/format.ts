export function formatDate(iso: string): string {
  const date = new Date(iso);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${formatDate(iso)} ${hh}:${min}`;
}

export function extractDomain(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function guessTitleFromUrl(url: string): string {
  try {
    const { pathname, hostname } = new URL(url);
    const segments = pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    if (!last) {
      return `${hostname.replace(/^www\./, "")}의 기사`;
    }
    const cleaned = last
      .replace(/\.(html?|aspx?|php)$/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\d{6,}\b/g, "")
      .trim();
    if (!cleaned) {
      return `${hostname.replace(/^www\./, "")}의 기사`;
    }
    return cleaned.length > 60 ? `${cleaned.slice(0, 60)}...` : cleaned;
  } catch {
    return "불러온 외부 기사";
  }
}
