import { buildSections } from "./sections";
import { sectionsOf, type Proposal } from "@/lib/proposal";
import { SECTION_ORDER, type SectionKey } from "@/lib/dataponto";

export function useVisibleSections(proposal: Proposal, publicView = false) {
  const enabled = sectionsOf(proposal);
  const all = buildSections(proposal, { publicView });
  return SECTION_ORDER.filter((k) => enabled[k]).map((k) => ({
    key: k as SectionKey,
    node: all.find((s) => s.key === k)?.node ?? null,
  }));
}

export function ProposalDocument({
  proposal,
  publicView = false,
}: {
  proposal: Proposal;
  publicView?: boolean;
}) {
  const sections = useVisibleSections(proposal, publicView);
  return (
    <div className="w-full">
      {sections.map((s) => (
        <div key={s.key} className="fade-up">
          {s.node}
        </div>
      ))}
    </div>
  );
}
