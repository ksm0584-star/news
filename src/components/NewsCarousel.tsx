import { MOCK_NEWS } from "@/lib/mock-news";
import NewsCard from "./NewsCard";

export default function NewsCarousel() {
  return (
    <section className="pt-5">
      <h2 className="px-5 text-[15px] font-bold text-foreground">
        최신 경제뉴스
      </h2>
      <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-5 pb-1 snap-x snap-mandatory">
        {MOCK_NEWS.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
