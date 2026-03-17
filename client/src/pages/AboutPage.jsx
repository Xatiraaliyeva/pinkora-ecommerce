import React from "react";
import "./AboutPage.css";

export default function AboutPage() {
  return (
    <main className="about-page">
      <div className="about-page__container">
        <div className="about-page__card">
          <span className="about-page__badge">Haqqımızda</span>

          <h1 className="about-page__title">Sayt haqqında məlumat</h1>

          <p className="about-page__text">
            Bu sayt istifadəçilərə məhsullara rahat baxmaq, bəyəndiklərini
            seçilmişlərə əlavə etmək, səbətə yığmaq və sifarişlərini izləmək
            imkanı yaratmaq üçün hazırlanıb.
          </p>

          <p className="about-page__text">
            Məqsəd sadə, rahat və zövqlü alış-veriş təcrübəsi təqdim etməkdir.
            Saytda məhsul baxışı, profil idarəetməsi, sifariş səhifəsi və digər
            əsas bölmələr istifadəçi rahatlığı üçün qurulub.
          </p>

          <p className="about-page__text">
            Dizayn hissəsində isə təmiz görünüş, rahat oxunuş və müasir istifadəçi
            təcrübəsi əsas götürülüb. Sayt həm adi istifadəçilər, həm də idarəetmə
            üçün ayrıca admin panel strukturu ilə təşkil olunub.
          </p>
        </div>
      </div>
    </main>
  );
}