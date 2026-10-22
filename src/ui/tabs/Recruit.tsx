import { CHAR_ORDER, CHARACTERS, type CharId, dormCapacity, FACILITIES, recruit, recruitBlocker, rosterIds } from "../../game";
import { useStore } from "../../store";
import { fmt, portraitUrl } from "../assets";
import { TabHead } from "../Shell";

export function Recruit() {
  const g = useStore((s) => s.game)!;
  const act = useStore((s) => s.act);
  const play = useStore((s) => s.play);
  const candidates = CHAR_ORDER.filter((id) => CHARACTERS[id].recruit);
  const full = rosterIds(g).length >= dormCapacity(g.facilities.dorm.level);

  const doRecruit = (id: CharId) => {
    if (act((s) => { recruit(s, id); return true; })) play({ sceneId: `recruit_${id}`, char: id, replay: false });
  };

  return (
    <>
      <TabHead title="招募" sub={`提升声望和设施，邀请更多对魔忍加入你的队伍。宿舍 ${rosterIds(g).length} / ${dormCapacity(g.facilities.dorm.level)}`} wm="募" />
      <div className="tab-body rec-grid">
        {candidates.map((id) => {
          const def = CHARACTERS[id];
          const req = def.recruit!;
          const joined = !!g.roster[id];
          const blocker = recruitBlocker(g, id);
          const fac = req.facility;
          return (
            <div key={id} className={`panel rcard ${!joined && blocker ? "locked" : ""}`} style={{ ["--c" as string]: def.color }}>
              <img className="pt" src={portraitUrl(id)} alt="" />
              <div className="body">
                <span className="tt">{def.title}</span>
                <span className="nm">{def.name} <span className={`rarity ${def.aptitude}`}>{def.aptitude}</span></span>
                <span className="chip" style={{ alignSelf: "flex-start" }}>{def.role}</span>
                {joined ? (
                  <div className="reqs"><span className="req ok">已加入队伍</span></div>
                ) : (
                  <div className="reqs num">
                    <span className={`req ${g.resources.reputation >= req.reputation ? "ok" : "no"}`}>声望 {req.reputation}</span>
                    {fac && <span className={`req ${g.facilities[fac[0]].level >= fac[1] ? "ok" : "no"}`}>{FACILITIES[fac[0]].name} {fac[1]} 级</span>}
                    <span className={`req ${!full ? "ok" : "no"}`}>宿舍空位</span>
                    <span className={`req ${g.resources.funds >= req.funds ? "ok" : "no"}`}>资金 {fmt(req.funds)}</span>
                  </div>
                )}
                <div className="foot">
                  {!joined && (
                    <button className="btn primary sm" disabled={!!blocker} onClick={() => doRecruit(id)}>
                      {blocker ?? "邀请加入"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
