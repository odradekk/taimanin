import { buyGift, ITEMS } from "../../game";
import { useStore } from "../../store";
import { TabHead } from "../Shell";

export function Shop() {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const toast = useStore((s) => s.toast);

  return (
    <>
      <TabHead title="商店" sub="购买礼物，在成员页赠送。送出对方喜欢的礼物，羁绊提升更多。养成材料只能从任务中获得。" wm="商" />
      <div className="tab-body shop-grid">
        {ITEMS.filter((it) => it.kind === "gift").map((gift) => {
          const id = gift.id;
          return (
            <div key={id} className="panel item">
              <span className="ic">{gift.icon}</span>
              <span className="nm">{gift.name}</span>
              <span className="ds">{gift.desc}</span>
              <div className="ft">
                <span className="faint num">持有 {g.inventory[id] ?? 0}</span>
                <button className="btn sm primary" disabled={g.resources.funds < gift.price!}
                  onClick={() => act((s) => { buyGift(s, id); return true; }) && toast(`购买了${gift.name}`, "good")}>
                  {gift.price} 资金
                </button>
              </div>
            </div>
          );
        })}
        <div className="section-title" style={{ gridColumn: "1 / -1" }}>养成材料</div>
        {ITEMS.filter((it) => it.kind === "material").map((it) => (
          <div key={it.id} className="panel item">
            <span className="ic">{it.icon}</span>
            <span className="nm">{it.name}</span>
            <span className="ds">{it.desc}</span>
            <div className="ft"><span className="faint num">持有 {g.inventory[it.id] ?? 0}</span></div>
          </div>
        ))}
      </div>
    </>
  );
}
