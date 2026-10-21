import { GIFT_ORDER, GIFTS } from "../../game/data/training";
import { buyGift } from "../../game/rules";
import type { GiftId } from "../../game/types";
import { useStore } from "../../store";
import { TabHead } from "../Shell";

const ICONS: Record<GiftId, string> = { yokan: "羹", matcha: "茶", sake: "酒", gunkit: "械", whetstone: "砥", parts: "件", tomato: "汁", novel: "书" };

export function Shop() {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const toast = useStore((s) => s.toast);

  return (
    <>
      <TabHead title="商店" sub="购买礼物，在成员页赠送。送出对方喜欢的礼物，羁绊提升更多。" wm="商" />
      <div className="tab-body shop-grid">
        {GIFT_ORDER.map((id) => {
          const gift = GIFTS[id];
          return (
            <div key={id} className="panel item">
              <span className="ic">{ICONS[id]}</span>
              <span className="nm">{gift.name}</span>
              <span className="ds">{gift.desc}</span>
              <div className="ft">
                <span className="faint num">持有 {g.inventory[id] ?? 0}</span>
                <button className="btn sm primary" disabled={g.resources.funds < gift.price}
                  onClick={() => act((s) => { buyGift(s, id); return true; }) && toast(`购买了${gift.name}`, "good")}>
                  {gift.price} 资金
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
