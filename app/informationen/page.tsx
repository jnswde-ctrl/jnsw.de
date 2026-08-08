import type { Metadata } from "next";
import { SectionPage } from "../SectionPage";

export const metadata: Metadata = {
  title: "Informationen zu digitalen Produkten | JNSW.DE",
};
export default function InformationenPage() {
  return (
    <SectionPage
      label="Informationen"
      title={
        <>
          Notizen,
          <br />
          die <em>folgen.</em>
        </>
      }
      intro="Dieser Bereich entsteht mit den ersten veröffentlichten Beiträgen zu digitalen Produkten, Werkzeugen und ihrer Umsetzung."
    />
  );
}
