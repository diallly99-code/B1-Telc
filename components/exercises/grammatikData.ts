import { GrammatikExerciseData } from '../../types';

export const STATIC_GRAMMAR_DATA: Record<number, GrammatikExerciseData> = {
    1: {
        title: 'Haupt- und Nebensätze',
        objective: 'Verstehen, wann das Verb am Ende steht.',
        exercise_type: 'QCM',
        level: 'A2',
        content: [
            { question: 'Hanna ist glücklich, weil ...', options: ['sie heute Geburtstag hat.', 'sie hat heute Geburtstag.'], answer: 'sie heute Geburtstag hat.', explanation: 'Dans la subordonnée avec "weil", le verbe conjugué "hat" doit être à la fin.' },
            { question: 'Sie hat gesagt, dass ...', options: ['ihr gefallen die Geschenke.', 'ihr die Geschenke gefallen.'], answer: 'ihr die Geschenke gefallen.', explanation: 'Dans la subordonnée avec "dass", le verbe conjugué "gefallen" doit être à la fin.' },
            { question: 'Sie freut sich besonders, wenn ...', options: ['ihre Tante aus Wien kommt.', 'ihre Tante kommt aus Wien.'], answer: 'ihre Tante aus Wien kommt.', explanation: 'Dans la subordonnée avec "wenn", le verbe conjugué "kommt" doit être à la fin.' },
            { question: 'Sie hat fünf Freunde eingeladen, weil ...', options: ['sie wird fünf Jahre alt.', 'sie fünf Jahre alt wird.'], answer: 'sie fünf Jahre alt wird.', explanation: 'Dans la subordonnée avec "weil", le verbe conjugué "wird" doit être à la fin.' },
            { question: 'Ich weiß nicht, ob ...', options: ['er morgen Zeit hat.', 'hat er morgen Zeit.'], answer: 'er morgen Zeit hat.', explanation: 'Dans la question indirecte avec "ob", le verbe conjugué "hat" doit être à la fin.' },
            { question: 'Er bleibt zu Hause, weil ...', options: ['er ist krank.', 'er krank ist.'], answer: 'er krank ist.', explanation: 'Dans la subordonnée avec "weil", le verbe conjugué "ist" doit être à la fin.' },
            { question: 'Kannst du mir sagen, wann ...', options: ['der Zug abfährt?', 'fährt der Zug ab?'], answer: 'der Zug abfährt?', explanation: 'Dans la question indirecte avec "wann", le verbe conjugué "abfährt" doit être à la fin.' },
            { question: 'Obwohl es regnet, ...', options: ['gehe ich spazieren.', 'ich gehe spazieren.'], answer: 'gehe ich spazieren.', explanation: 'Quand la subordonnée est en première position, le verbe de la principale vient juste après la virgule.' },
            { question: 'Ich lerne Deutsch, damit ...', options: ['ich kann in Deutschland arbeiten.', 'ich in Deutschland arbeiten kann.'], answer: 'ich in Deutschland arbeiten kann.', explanation: 'Dans la subordonnée avec "damit", le verbe modal "kann" doit être à la fin.' },
            { question: 'Warte, bis ...', options: ['ich fertig bin.', 'bin ich fertig.'], answer: 'ich fertig bin.', explanation: 'Dans la subordonnée avec "bis", le verbe conjugué "bin" doit être à la fin.' },
        ]
    },
    2: {
        title: 'Nebensätze mit "weil"',
        objective: 'Sätze mit "weil" bilden.',
        exercise_type: 'Reformulation',
        level: 'A2',
        content: [
            { question: 'Ich kann die E-Mails nicht schicken. Ich habe heute kein Internet.', answer: 'Ich kann die E-Mails nicht schicken, weil ich heute kein Internet habe.', explanation: 'Connectez les deux phrases avec "weil". Le verbe de la deuxième phrase ("habe") va à la fin.' },
            { question: 'Der Drucker funktioniert nicht. Das Kabel ist kaputt.', answer: 'Der Drucker funktioniert nicht, weil das Kabel kaputt ist.', explanation: 'Connectez les deux phrases avec "weil". Le verbe de la deuxième phrase ("ist") va à la fin.' },
            { question: 'Herr Schröder ist aufgeregt. Er kann seinen Terminkalender nicht finden.', answer: 'Herr Schröder ist aufgeregt, weil er seinen Terminkalender nicht finden kann.', explanation: 'Connectez avec "weil". Le verbe modal ("kann") va à la fin.' },
            { question: 'Ich muss den Text noch einmal schreiben. Ich habe die Datei nicht gespeichert.', answer: 'Ich muss den Text noch einmal schreiben, weil ich die Datei nicht gespeichert habe.', explanation: 'Connectez avec "weil". Le verbe auxiliaire ("habe") va à la fin.' },
            { question: 'Anna lernt Spanisch. Sie möchte nach Spanien reisen.', answer: 'Anna lernt Spanisch, weil sie nach Spanien reisen möchte.', explanation: 'Connectez avec "weil". Le verbe modal ("möchte") va à la fin.' },
            { question: 'Wir gehen heute nicht ins Kino. Der Film ist langweilig.', answer: 'Wir gehen heute nicht ins Kino, weil der Film langweilig ist.', explanation: 'Connectez avec "weil". Le verbe ("ist") va à la fin.' },
            { question: 'Er kauft ein neues Auto. Sein altes Auto ist kaputt.', answer: 'Er kauft ein neues Auto, weil sein altes Auto kaputt ist.', explanation: 'Connectez avec "weil". Le verbe ("ist") va à la fin.' },
            { question: 'Sie trinkt einen Tee. Ihr ist kalt.', answer: 'Sie trinkt einen Tee, weil ihr kalt ist.', explanation: 'Connectez avec "weil". Le verbe ("ist") va à la fin.' },
            { question: 'Ich stehe früh auf. Ich muss pünktlich bei der Arbeit sein.', answer: 'Ich stehe früh auf, weil ich pünktlich bei der Arbeit sein muss.', explanation: 'Connectez avec "weil". Le verbe modal ("muss") va à la fin.' },
            { question: 'Die Kinder spielen drinnen. Es regnet stark.', answer: 'Die Kinder spielen drinnen, weil es stark regnet.', explanation: 'Connectez avec "weil". Le verbe ("regnet") va à la fin.' },
        ]
    },
    3: {
        title: 'Nebensätze mit "wenn"',
        objective: 'Bedingung oder Gewohnheit ausdrücken.',
        exercise_type: 'Reformulation',
        level: 'A2',
        content: [
            { question: 'Miriam macht Urlaub. (Dann) fährt sie am liebsten ans Mittelmeer.', answer: 'Wenn Miriam Urlaub macht, fährt sie am liebsten ans Mittelmeer.', explanation: 'La subordonnée avec "wenn" est en première position, donc le verbe de la principale ("fährt") vient juste après la virgule.' },
            { question: 'Sie sucht im Internet. (Dann will) sie ein schönes Hotel finden.', answer: 'Wenn sie ein schönes Hotel finden will, sucht sie im Internet.', explanation: 'La subordonnée avec "wenn" est en première position, donc le verbe de la principale ("sucht") vient juste après la virgule.' },
            { question: 'Sie bekommt ein gutes Angebot. (Dafür muss) sie die Reise rechtzeitig buchen.', answer: 'Wenn sie die Reise rechtzeitig bucht, bekommt sie ein gutes Angebot.', explanation: 'La subordonnée avec "wenn" est en première position, donc le verbe de la principale ("bekommt") vient juste après la virgule.' },
            { question: 'Sie fährt mit dem Zug. (Dann) kommt sie entspannt in Italien an.', answer: 'Wenn sie mit dem Zug fährt, kommt sie entspannt in Italien an.', explanation: 'La subordonnée avec "wenn" est en première position, donc le verbe de la principale ("kommt") vient juste après la virgule.' },
            { question: 'Sie ist angekommen. (Dann) trinkt sie zuerst einen Cappuccino.', answer: 'Wenn sie angekommen ist, trinkt sie zuerst einen Cappuccino.', explanation: 'La subordonnée avec "wenn" est en première position, donc le verbe de la principale ("trinkt") vient juste après la virgule.' },
            { question: 'Miriam geht am Strand spazieren. (Dabei) sammelt sie Muscheln.', answer: 'Wenn Miriam am Strand spazieren geht, sammelt sie Muscheln.', explanation: 'La subordonnée avec "wenn" est en première position, donc le verbe de la principale ("sammelt") vient juste après la virgule.' },
            { question: 'Es ist schönes Wetter. (Dann) gehen wir schwimmen.', answer: 'Wenn schönes Wetter ist, gehen wir schwimmen.', explanation: 'La subordonnée avec "wenn" est en première position, donc le verbe de la principale ("gehen") vient juste après la virgule.' },
            { question: 'Ich habe Zeit. (Dann) besuche ich meine Freunde.', answer: 'Wenn ich Zeit habe, besuche ich meine Freunde.', explanation: 'La subordonnée avec "wenn" est en première position, donc le verbe de la principale ("besuche") vient juste après la virgule.' },
            { question: 'Du kommst zu spät. (Dann) musst du warten.', answer: 'Wenn du zu spät kommst, musst du warten.', explanation: 'La subordonnée avec "wenn" est en première position, donc le verbe de la principale ("musst") vient juste après la virgule.' },
            { question: 'Er lernt viel. (Dann) bekommt er gute Noten.', answer: 'Wenn er viel lernt, bekommt er gute Noten.', explanation: 'La subordonnée avec "wenn" est en première position, donc le verbe de la principale ("bekommt") vient juste après la virgule.' },
        ]
    },
    4: {
        title: 'weil, deshalb oder denn',
        objective: 'Kausalität richtig ausdrücken.',
        exercise_type: 'Texte à trous',
        level: 'A2',
        content: [
            { question: 'Morgens hat es sehr geregnet, ___ sind wir zuerst im Hotel geblieben.', answer: 'deshalb', explanation: '"deshalb" introduit une conséquence. Le verbe "sind" est en position 2.' },
            { question: 'Wir hatten keine Schirme dabei, ___ die Wettervorhersage gut gewesen war.', answer: 'weil', explanation: '"weil" introduit une cause. Le verbe "war" est à la fin.' },
            { question: 'Am Nachmittag haben wir einen Stadtrundgang gemacht, ___ das Wetter besser geworden war.', answer: 'weil', explanation: '"weil" introduit une cause. Le verbe "war" est à la fin.' },
            { question: 'Wir waren ganz begeistert, ___ unsere Stadtführerin hat uns viel gezeigt.', answer: 'denn', explanation: '"denn" introduit une cause avec une structure de phrase principale (verbe en position 2).' },
            { question: 'Auf jeden Fall wollen wir noch ins Kunstmuseum, ___ moderne Kunst uns sehr interessiert.', answer: 'weil', explanation: '"weil" introduit une cause. Le verbe "interessiert" est à la fin.' },
            { question: 'Ich bin müde, ___ ich habe schlecht geschlafen.', answer: 'denn', explanation: '"denn" introduit une cause avec une structure de phrase principale.' },
            { question: 'Ich habe schlecht geschlafen, ___ bin ich müde.', answer: 'deshalb', explanation: '"deshalb" introduit une conséquence.' },
            { question: 'Er hat den Bus verpasst, ___ er zu spät aufgestanden ist.', answer: 'weil', explanation: '"weil" introduit une cause, verbe à la fin.' },
            { question: 'Sie hat Hunger, ___ hat sie noch nichts gegessen.', answer: 'deshalb', explanation: '"deshalb" introduit une conséquence.' },
            { question: 'Wir bleiben zu Hause, ___ das Wetter ist schlecht.', answer: 'denn', explanation: '"denn" introduit une cause avec une structure de phrase principale.' }
        ]
    },
    5: {
        title: 'weil oder deshalb – Einkäufe',
        objective: 'Cause vs conséquence unterscheiden.',
        exercise_type: 'Reformulation',
        level: 'A2',
        content: [
            { question: 'Manchmal muss Simon noch am Abend einkaufen. Grund: Er hat am Tag keine Zeit.', answer: 'Manchmal muss Simon noch am Abend einkaufen, weil er am Tag keine Zeit hat.', explanation: 'Utilisez "weil" pour la cause. Le verbe va à la fin.' },
            { question: 'Manchmal muss Simon noch am Abend einkaufen. Folge: Er kommt spät nach Hause.', answer: 'Manchmal muss Simon noch am Abend einkaufen, deshalb kommt er spät nach Hause.', explanation: 'Utilisez "deshalb" pour la conséquence. Le verbe vient juste après.' },
            { question: 'Tim gibt viel Geld für Bücher aus. Grund: Literatur ist sein Hobby.', answer: 'Tim gibt viel Geld für Bücher aus, weil Literatur sein Hobby ist.', explanation: 'Utilisez "weil" pour la cause. Le verbe va à la fin.' },
            { question: 'Tim gibt viel Geld für Bücher aus. Folge: Er braucht ein neues Bücherregal.', answer: 'Tim gibt viel Geld für Bücher aus, deshalb braucht er ein neues Bücherregal.', explanation: 'Utilisez "deshalb" pour la conséquence. Le verbe vient juste après.' },
            { question: 'Leandra braucht neue Laufschuhe. Grund: Sie trainiert für einen Marathon.', answer: 'Leandra braucht neue Laufschuhe, weil sie für einen Marathon trainiert.', explanation: 'Utilisez "weil" pour la cause. Le verbe va à la fin.' },
            { question: 'Leandra braucht neue Laufschuhe. Folge: Sie geht in ein Sportgeschäft.', answer: 'Leandra braucht neue Laufschuhe, deshalb geht sie in ein Sportgeschäft.', explanation: 'Utilisez "deshalb" pour la conséquence. Le verbe vient juste après.' },
            { question: 'An den Kassen stehen viele Leute. Grund: Alle wollen vor den Feiertagen einkaufen.', answer: 'An den Kassen stehen viele Leute, weil alle vor den Feiertagen einkaufen wollen.', explanation: 'Utilisez "weil" pour la cause. Le verbe modal va à la fin.' },
            { question: 'An den Kassen stehen viele Leute. Folge: Wir müssen sehr lange warten.', answer: 'An den Kassen stehen viele Leute, deshalb müssen wir sehr lange warten.', explanation: 'Utilisez "deshalb" pour la conséquence. Le verbe vient juste après.' },
            { question: 'Herr Lorz kauft nur eine Milch. Grund: Er hat gestern die Milch vergessen.', answer: 'Herr Lorz kauft nur eine Milch, weil er gestern die Milch vergessen hat.', explanation: 'Utilisez "weil" pour la cause. L\'auxiliaire "hat" va à la fin.' },
            { question: 'Herr Lorz kauft nur eine Milch. Folge: Er nimmt keinen Einkaufswagen.', answer: 'Herr Lorz kauft nur eine Milch, deshalb nimmt er keinen Einkaufswagen.', explanation: 'Utilisez "deshalb" pour la conséquence. Le verbe vient juste après.' },
        ]
    },
    6: {
        title: 'weil, dass, wenn, deshalb – Brief',
        objective: 'Kombinieren und Konnektoren einsetzen.',
        exercise_type: 'Texte à trous',
        level: 'A2',
        content: [
            { question: 'Liebe Tanja, ich schreibe dir, ___ ich dir etwas Wichtiges erzählen will.', answer: 'weil', explanation: '"weil" (parce que) introduit une cause, avec le verbe à la fin.' },
            { question: 'Ich hoffe, ___ es dir gut geht.', answer: 'dass', explanation: '"dass" (que) introduit une proposition complétive, avec le verbe à la fin.' },
            { question: 'Ich war krank, ___ konnte ich nicht zur Party kommen.', answer: 'deshalb', explanation: '"deshalb" (c\'est pourquoi) introduit une conséquence, avec le verbe en 2ème position.' },
            { question: 'Ich komme dich besuchen, ___ ich wieder gesund bin.', answer: 'wenn', explanation: '"wenn" (quand, si) introduit une condition temporelle future, avec le verbe à la fin.' },
            { question: 'Weißt du, ___ der neue Film schon im Kino läuft?', answer: 'ob', explanation: '"ob" (si) introduit une question indirecte (oui/non), avec le verbe à la fin.' },
            { question: 'Ich glaube, ___ er sehr gut ist.', answer: 'dass', explanation: '"dass" (que) introduit une complétive qui rapporte une opinion.' },
            { question: '___ du Lust hast, können wir ihn zusammen ansehen.', answer: 'Wenn', explanation: '"Wenn" commence la phrase, le verbe de la principale ("können") vient donc juste après la virgule.' },
            { question: 'Es hat letzte Woche geschneit, ___ war es sehr kalt.', answer: 'deshalb', explanation: '"deshalb" introduit la conséquence de la neige.' },
            { question: '___ es am Wochenende sonnig ist, machen wir einen Spaziergang.', answer: 'Wenn', explanation: '"Wenn" introduit la condition pour le Spaziergang.' },
            { question: 'Ich freue mich, ___ ich dich bald sehe.', answer: 'dass', explanation: '"dass" introduit l\'objet de "Ich freue mich".' }
        ]
    },
    7: {
        title: 'W-Fragen (direkt & indirekt)',
        objective: 'W-Fragen und indirekte Fragen bilden.',
        exercise_type: 'Reformulation',
        level: 'A2',
        content: [
            { question: '[Direct] Réponse : Annika hat morgen Geburtstag. Question : ___', answer: 'Wer hat morgen Geburtstag?', explanation: 'On demande "qui ?", donc on utilise "Wer?".' },
            { question: '[Direct] Réponse : Sie wird 17 Jahre alt. Question : ___', answer: 'Wie alt wird sie?', explanation: 'On demande l\'âge, donc on utilise "Wie alt?".' },
            { question: '[Direct] Réponse : Ihre Freunde planen eine Überraschungsparty. Question : ___', answer: 'Was planen ihre Freunde?', explanation: 'On demande "quoi ?", donc on utilise "Was?".' },
            { question: '[Direct] Réponse : Die Party beginnt um 18 Uhr. Question : ___', answer: 'Wann beginnt die Party?', explanation: 'On demande l\'heure, donc on utilise "Wann?".' },
            { question: '[Direct] Réponse : Sie findet im Jugendtreff statt. Question : ___', answer: 'Wo findet sie statt?', explanation: 'On demande le lieu, donc on utilise "Wo?".' },
            { question: '[Indirect] Question : Wer hat morgen Geburtstag? -> Ich weiß nicht, ___', answer: 'wer morgen Geburtstag hat.', explanation: 'Dans une question indirecte, le verbe conjugué "hat" va à la fin.' },
            { question: '[Indirect] Question : Wo wohnst du? -> Kannst du mir sagen, ___', answer: 'wo du wohnst?', explanation: 'Dans une question indirecte, le verbe conjugué "wohnst" va à la fin.' },
            { question: '[Indirect] Question : Wann kommt der Bus? -> Hast du eine Ahnung, ___', answer: 'wann der Bus kommt?', explanation: 'Dans une question indirecte, le verbe conjugué "kommt" va à la fin.' },
            { question: '[Indirect] Question : Warum ist er traurig? -> Ich frage mich, ___', answer: 'warum er traurig ist.', explanation: 'Dans une question indirecte, le verbe conjugué "ist" va à la fin.' },
            { question: '[Indirect] Question : Wie viel kostet das? -> Weißt du, ___', answer: 'wie viel das kostet?', explanation: 'Dans une question indirecte, le verbe conjugué "kostet" va à la fin.' }
        ]
    },
    8: {
        title: 'Relativsätze',
        objective: 'Relativpronomen erkennen und verwenden.',
        exercise_type: 'Texte à trous',
        level: 'A2',
        content: [
            { question: 'Ich suche eine Wohnung, ___ im Zentrum liegt.', answer: 'die', explanation: '"die" se rapporte à "die Wohnung" (féminin, nominatif).' },
            { question: 'Der Makler, ___ ich angerufen habe, hat mir zwei Wohnungen angeboten.', answer: 'den', explanation: '"den" se rapporte à "der Makler" (masculin, accusatif car "ich habe DEN Makler angerufen").' },
            { question: 'Das ist das Haus, in ___ meine Tante wohnt.', answer: 'dem', explanation: '"dem" se rapporte à "das Haus" (neutre, datif car "in + wo? -> Dativ").' },
            { question: 'Kennst du den Mann, ___ dort steht?', answer: 'der', explanation: '"der" se rapporte à "der Mann" (masculin, nominatif car c\'est le sujet de la subordonnée).' },
            { question: 'Das Geld, ___ ich gespart habe, reicht nicht.', answer: 'das', explanation: '"das" se rapporte à "das Geld" (neutre, accusatif car "ich habe DAS Geld gespart").' },
            { question: 'Die Kinder, mit ___ ich spiele, sind nett.', answer: 'denen', explanation: '"denen" se rapporte à "die Kinder" (pluriel, datif car "mit + Dativ").' },
            { question: 'Das ist der Freund, ___ Auto kaputt ist.', answer: 'dessen', explanation: '"dessen" exprime la possession pour un nom masculin/neutre ("das Auto DES Freundes").' },
            { question: 'Die Frau, ___ Tasche gestohlen wurde, geht zur Polizei.', answer: 'deren', explanation: '"deren" exprime la possession pour un nom féminin/pluriel ("die Tasche DER Frau").' },
            { question: 'Ich lese ein Buch, ___ sehr spannend ist.', answer: 'das', explanation: '"das" se rapporte à "das Buch" (neutre, nominatif).' },
            { question: 'Die Freunde, ___ ich eingeladen habe, kommen alle.', answer: 'die', explanation: '"die" se rapporte à "die Freunde" (pluriel, accusatif car "ich habe DIE Freunde eingeladen").' }
        ]
    },
     9: {
        title: 'Relativsätze – Sätze verbinden',
        objective: 'Zwei Sätze verbinden.',
        exercise_type: 'Reformulation',
        level: 'A2',
        content: [
            { question: 'Das ist ein tolles Buch. Ich habe es schon dreimal gelesen.', answer: 'Das ist ein tolles Buch, das ich schon dreimal gelesen habe.', explanation: 'Le pronom relatif "das" remplace "es" (das Buch) et devient l\'objet accusatif de la subordonnée.' },
            { question: 'Das Museum sammelt Zeichnungen. Sie stammen aus dem 18. Jahrhundert.', answer: 'Das Museum sammelt Zeichnungen, die aus dem 18. Jahrhundert stammen.', explanation: '"die" (pluriel) remplace "Sie" (die Zeichnungen) et devient le sujet de la subordonnée.' },
            { question: 'Gefallen dir die Plakate? Sie hängen überall in der Stadt.', answer: 'Gefallen dir die Plakate, die überall in der Stadt hängen?', explanation: '"die" (pluriel) remplace "Sie" (die Plakate) et devient le sujet de la subordonnée.' },
            { question: 'Der Filmkritiker schreibt für unsere Zeitung. Du hast ihn gestern kennengelernt.', answer: 'Der Filmkritiker, den du gestern kennengelernt hast, schreibt für unsere Zeitung.', explanation: '"den" remplace "ihn" (der Filmkritiker) et devient l\'objet accusatif de la subordonnée.' },
            { question: 'Ich habe ein Auto gekauft. Es war sehr teuer.', answer: 'Das Auto, das ich gekauft habe, war sehr teuer.', explanation: '"das" remplace "es" (das Auto) et devient l\'objet accusatif de la subordonnée.' },
            { question: 'Wir besuchen unsere Freunde. Sie wohnen in Hamburg.', answer: 'Wir besuchen unsere Freunde, die in Hamburg wohnen.', explanation: '"die" (pluriel) remplace "Sie" (die Freunde) et devient le sujet de la subordonnée.' },
            { question: 'Das ist die Professorin. Ich habe mit ihr gesprochen.', answer: 'Das ist die Professorin, mit der ich gesprochen habe.', explanation: '"der" remplace "ihr" (die Professorin) et est au datif à cause de "mit".' },
            { question: 'Der Kuchen schmeckt gut. Meine Oma hat ihn gebacken.', answer: 'Der Kuchen, den meine Oma gebacken hat, schmeckt gut.', explanation: '"den" remplace "ihn" (der Kuchen) et devient l\'objet accusatif de la subordonnée.' },
            { question: 'Das Kind spielt im Garten. Es ist mein Neffe.', answer: 'Das Kind, das im Garten spielt, ist mein Neffe.', explanation: '"das" remplace "Es" (das Kind) et devient le sujet de la subordonnée.' },
            { question: 'Die Frau ist sehr nett. Ich habe ihr geholfen.', answer: 'Die Frau, der ich geholfen habe, ist sehr nett.', explanation: '"der" remplace "ihr" (die Frau) et est au datif, car c\'est l\'objet indirect de "helfen".' }
        ]
    },
    10: {
        title: 'Artikelwörter – Pronomen – Indefinita',
        objective: 'Unbestimmte/Bestimmte Wörter wählen.',
        exercise_type: 'Texte à trous',
        level: 'A2',
        content: [
            { question: 'Stell dir vor, ich habe mir ___ gekauft!', answer: 'etwas', explanation: '"etwas" est utilisé pour désigner une chose indéfinie.' },
            { question: 'Was denn? Mach ___ solches Geheimnis daraus!', answer: 'kein', explanation: '"kein Geheimnis machen" est une expression qui signifie "ne pas faire de mystère".' },
            { question: 'Ich habe ___ gespart und gestern war es so weit.', answer: 'alles', explanation: '"alles" signifie "tout", dans le sens de tout son argent.' },
            { question: 'Ich habe mir ___ Motorrad gekauft!', answer: 'ein', explanation: 'Article indéfini pour "das Motorrad" à l\'accusatif.' },
            { question: 'Wow, ich weiß, dass du schon vor drei Jahren ___ Führerschein gemacht hast.', answer: 'deinen', explanation: 'Pronom possessif pour "der Führerschein" à l\'accusatif.' },
            { question: '___ ist denn für die Straße?', answer: 'Es', explanation: 'Pronom personnel "Es" se référant au moto ("das Motorrad").' },
            { question: 'Ich möchte ___ Urlaub irgendwohin fahren.', answer: 'einen', explanation: 'Article indéfini pour "der Urlaub" à l\'accusatif.' },
            { question: 'Nur fahren und dabei ___ Leute anschauen.', answer: 'viele', explanation: '"viele" (beaucoup de) est utilisé pour un nombre indéfini de personnes.' },
            { question: 'Und ___ das nicht gefällt, ist mir egal.', answer: 'wem', explanation: '"wem" est le pronom interrogatif/relatif au datif ("à qui" cela ne plaît pas).' },
            { question: 'Und ___ sagt, dass ich weiter muss, wird ignoriert.', answer: 'wer', explanation: '"wer" est le pronom relatif pour "celui qui".' }
        ]
    },
    11: {
        title: 'Adjektivendungen I',
        objective: 'Adjektivendungen nach Artikeln.',
        exercise_type: 'Texte à trous',
        level: 'A2',
        content: [
            { question: 'Wie findest du den grün__ Rock?', answer: 'grünen', explanation: 'Après un article défini (den), à l\'accusatif masculin, l\'adjectif prend "-en".' },
            { question: 'Das modisch__ Kleid ist neu.', answer: 'modische', explanation: 'Après un article défini (das), au nominatif neutre, l\'adjectif prend "-e".' },
            { question: 'Hast du einen neu__ Mantel?', answer: 'neuen', explanation: 'Après un article indéfini (einen), à l\'accusatif masculin, l\'adjectif prend "-en".' },
            { question: 'Ich sehe einen alt__ Mann.', answer: 'alten', explanation: 'Après un article indéfini (einen), à l\'accusatif masculin, l\'adjectif prend "-en".' },
            { question: 'Die klein__ Katze trinkt Milch.', answer: 'kleine', explanation: 'Après un article défini (die), au nominatif féminin, l\'adjectif prend "-e".' },
            { question: 'Wir wohnen in einem groß__ Haus.', answer: 'großen', explanation: 'Après un article indéfini (einem), au datif neutre, l\'adjectif prend "-en".' },
            { question: 'Das ist ein teur__ Auto.', answer: 'teures', explanation: 'Après un article indéfini (ein), au nominatif neutre, l\'adjectif prend "-es".' },
            { question: 'Er spricht mit der jung__ Frau.', answer: 'jungen', explanation: 'Après un article défini (der), au datif féminin, l\'adjectif prend "-en".' },
            { question: 'Ich esse gern frisch__ Brot.', answer: 'frisches', explanation: 'Sans article (null article), au neutre accusatif, l\'adjectif prend la terminaison de l\'article défini "-es".' },
            { question: 'Hast du die neu__ Schuhe (Plural) gesehen?', answer: 'neuen', explanation: 'Après un article défini (die), à l\'accusatif pluriel, l\'adjectif prend "-en".' }
        ]
    },
    12: {
        title: 'Adjektivendungen II – Im Kontext',
        objective: 'Répéter et automatiser la flexion.',
        exercise_type: 'Texte à trous',
        level: 'A2',
        content: [
            { question: 'Oh, das war ein ganz nett__ Abend.', answer: 'netter', explanation: 'Nominatif masculin après "ein" -> -er.' },
            { question: 'Wir waren in einem elegant__ Lokal...', answer: 'eleganten', explanation: 'Datif neutre après "einem" -> -en.' },
            { question: '...mit freundlich__ Bedienung.', answer: 'freundlicher', explanation: 'Datif féminin après "mit" (sans article) -> -er.' },
            { question: 'Meinst du das bekannt__ Restaurant?', answer: 'bekannte', explanation: 'Accusatif neutre après "das" -> -e.' },
            { question: '...hat man von dort eine wunderschön__ Aussicht...', answer: 'wunderschöne', explanation: 'Accusatif féminin après "eine" -> -e.' },
            { question: '...auf die ganz__ Stadt.', answer: 'ganze', explanation: 'Accusatif féminin après "die" -> -e.' },
            { question: 'Richtig, ich war auch dort mit meinem neu__ Freund.', answer: 'neuen', explanation: 'Datif masculin après "meinem" -> -en.' },
            { question: 'Vielleicht habe ich auch bald eine neu__ Freundin.', answer: 'neue', explanation: 'Accusatif féminin après "eine" -> -e.' },
            { question: 'Sie hat lang__ Haare (Plural).', answer: 'lange', explanation: 'Accusatif pluriel sans article -> -e.' },
            { question: '...und schön__ Augen (Plural).', answer: 'schöne', explanation: 'Accusatif pluriel sans article -> -e.' }
        ]
    },
     13: {
        title: 'Komparativ',
        objective: 'Vergleichsformen bilden.',
        exercise_type: 'Texte à trous',
        level: 'A2',
        content: [
            { question: 'Ingo mag Bücher ___ (gern) als Filme.', answer: 'lieber', explanation: 'Le comparatif de "gern" est irrégulier : "lieber".' },
            { question: 'Antje schmeckt das Essen zu Hause ___ (gut) als im Restaurant.', answer: 'besser', explanation: 'Le comparatif de "gut" est irrégulier : "besser".' },
            { question: 'Für Marion ist Schweden ___ (interessant) als die USA.', answer: 'interessanter', explanation: 'Comparatif régulier : adjectif + "-er".' },
            { question: 'Semir isst gern Süßes: viel Kuchen und noch ___ (viel) Eis.', answer: 'mehr', explanation: 'Le comparatif de "viel" est irrégulier : "mehr".' },
            { question: 'Christian hört Musik ___ (laut) als seine Familie.', answer: 'lauter', explanation: 'Comparatif régulier : adjectif + "-er".' },
            { question: 'Olivia kann ___ (schnell) laufen als ihre Schwester.', answer: 'schneller', explanation: 'Comparatif régulier : adjectif + "-er".' },
            { question: 'Peter fährt ___ (gern) in die Berge als ans Meer.', answer: 'lieber', explanation: 'Le comparatif de "gern" est "lieber".' },
            { question: 'Mein Auto ist ___ (alt) als dein Auto.', answer: 'älter', explanation: 'Comparatif avec "Umlaut" : "alt" -> "älter".' },
            { question: 'Dieser Weg ist ___ (kurz) als der andere.', answer: 'kürzer', explanation: 'Comparatif avec "Umlaut" : "kurz" -> "kürzer".' },
            { question: 'Im Sommer sind die Tage ___ (lang) als im Winter.', answer: 'länger', explanation: 'Comparatif avec "Umlaut" : "lang" -> "länger".' }
        ]
    },
    14: {
        title: 'Wechselpräpositionen – Dativ oder Akkusativ',
        objective: 'Ort vs Richtung unterscheiden.',
        exercise_type: 'Texte à trous',
        level: 'A2',
        content: [
            { question: 'Ich habe die Flaschen schon ___ Keller gebracht.', answer: 'in den', explanation: '"Wohin?" (direction) + "in" -> Accusatif. "der Keller" -> "in den Keller".' },
            { question: 'Sie stehen ___ der Waschmaschine und ___ Trockner.', answer: 'zwischen dem', explanation: '"Wo?" (lieu) + "zwischen" -> Datif. "die Waschmaschine", "der Trockner" -> "zwischen der... und dem...".' },
            { question: 'Stell sie bitte ___ Tisch.', answer: 'auf den', explanation: '"Wohin?" (direction) + "auf" -> Accusatif. "der Tisch" -> "auf den Tisch".' },
            { question: 'Sind die Säfte noch ___ Kofferraum?', answer: 'im', explanation: '"Wo?" (lieu) + "in" -> Datif. "der Kofferraum" -> "in dem" -> "im".' },
            { question: 'Ich stelle sie gleich ___ Kühlschrank.', answer: 'in den', explanation: '"Wohin?" (direction) + "in" -> Accusatif. "der Kühlschrank" -> "in den Kühlschrank".' },
            { question: '___ Kühlschrank ist kein Platz mehr.', answer: 'Im', explanation: '"Wo?" (lieu) + "in" -> Datif. "der Kühlschrank" -> "in dem" -> "Im".' },
            { question: 'Stell sie lieber ___ Keller.', answer: 'in den', explanation: '"Wohin?" (direction) + "in" -> Accusatif. "der Keller" -> "in den Keller".' },
            { question: 'Soll ich die Tasche ___ Garage lassen?', answer: 'in der', explanation: '"Wo?" (lieu) + "in" -> Datif. "die Garage" -> "in der Garage".' },
            { question: 'Nein, bring das alles bitte ___ Bad.', answer: 'ins', explanation: '"Wohin?" (direction) + "in" -> Accusatif. "das Bad" -> "in das" -> "ins".' },
            { question: 'Die Schlüssel liegen ___ Fahrersitz.', answer: 'auf dem', explanation: '"Wo?" (lieu) + "auf" -> Datif. "der Fahrersitz" -> "auf dem Fahrersitz".' }
        ]
    },
    15: {
        title: 'Ergänzen Sie die Präpositionen im Text',
        objective: 'Feste Präpositionen trainieren.',
        exercise_type: 'QCM',
        level: 'A2',
        content: [
            { question: 'Liebe Inka, vielen Dank (1)___ deine E-Mail.', options: ['für', 'hinter', 'vor'], answer: 'für', explanation: '"Danke für etwas" (remercier pour quelque chose) est une expression fixe avec "für" + accusatif.' },
            { question: '...als ich sie (2)___ meiner Mailbox gesehen habe.', options: ['auf', 'aus', 'in'], answer: 'in', explanation: 'On voit quelque chose "dans" sa boîte mail ("in der Mailbox"). "Wo?" -> Datif.' },
            { question: 'Ich wollte mich schon (3)___ der letzten Woche melden.', options: ['bis', 'mit', 'seit'], answer: 'seit', explanation: '"Seit" + datif est utilisé pour indiquer le point de départ d\'une action qui continue dans le présent (depuis la semaine dernière).' },
            { question: '...aber da war ich noch (4)___ meinem Umzug sehr beschäftigt.', options: ['für', 'mit', 'zu'], answer: 'mit', explanation: '"beschäftigt sein mit etwas" (être occupé par quelque chose) est une expression fixe qui utilise "mit" + datif.' },
            { question: 'Wie du ja weißt, bin ich (5)___ eine größere Wohnung umgezogen.', options: ['in', 'nach', 'um'], answer: 'in', explanation: '"umziehen in" + accusatif est utilisé pour indiquer la destination d\'un déménagement.' },
            { question: 'Die liegt zwar ein bisschen weiter weg (6)___ Zentrum...', options: ['bis zum', 'vom', 'vor dem'], answer: 'vom', explanation: '"weg von" indique un éloignement par rapport à un lieu. "von dem" -> "vom".' },
            { question: 'Ich muss nur (7)___ die Straße gehen...', options: ['durch', 'gegenüber', 'über'], answer: 'durch', explanation: '"durch die Straße" peut signifier traverser ou longer la rue, mais ici "über" serait aussi possible. Dans ce contexte, les deux sont acceptables. L\'image-réponse est "durch".' },
            { question: '...und dann sind es nicht einmal 100 Meter (8)___ U-Bahn.', options: ['ab der', 'bis zur', 'von der'], answer: 'bis zur', explanation: '"bis zu" indique une distance jusqu\'à un point. "zu der" -> "zur".' },
            { question: 'Da bin ich wirklich viel schneller (9)___ der Uni.', options: ['bei', 'in', 'neben'], answer: 'bei', explanation: '"bei der Uni" signifie "à proximité de l\'université".' },
            { question: 'Da meine Wohnung (10)___ Dachgeschoss liegt...', options: ['im', 'über dem', 'zwischen dem'], answer: 'im', explanation: 'Pour indiquer un étage, on utilise "in" + datif. "in dem" -> "im".' },
        ]
    },
     16: {
        title: 'Ergänzen Sie die richtige Verbform im Text',
        objective: 'Zeitformen & Verben im Kontext richtig einsetzen.',
        exercise_type: 'QCM',
        level: 'A2',
        content: [
            { question: '...eigentlich (1)___ ich mich schon lange bei dir melden...', options: ['konnte', 'musste', 'wollte'], answer: 'wollte', explanation: '"wollte" (Präteritum de "wollen") exprime une intention passée ("je voulais").' },
            { question: '...aber ich (2)___ so wenig Zeit.', options: ['habe gehabt', 'hatte', 'hätte'], answer: 'hatte', explanation: 'Le récit est au passé (Präteritum), donc "hatte" (Präteritum de "haben") est correct.' },
            { question: 'Mein Projekt (3)___ fertig werden...', options: ['konnte', 'musste', 'wollte'], answer: 'musste', explanation: 'Il s\'agit d\'une obligation passée ("devait être terminé"), donc "musste" (Präteritum de "müssen").' },
            { question: '...und es (4)___ noch einiges daran zu machen.', options: ['gab', 'gebe', 'gibt'], answer: 'gab', explanation: 'Pour rester cohérent avec le temps du passé, on utilise "es gab" (il y avait), Präteritum de "es gibt".' },
            { question: 'Nicht einmal an meinem Geburtstag (5)___ ich frei machen!', options: ['darf', 'kann', 'konnte'], answer: 'konnte', explanation: 'Il exprime une impossibilité passée ("je ne pouvais pas"), donc "konnte" (Präteritum de "können").' },
            { question: '...ich (6)___ leider im Büro.', options: ['bin', 'habe', 'war'], answer: 'war', explanation: 'Pour décrire une situation passée, on utilise "war" (Präteritum de "sein").' },
            { question: 'Aber am letzten Montag haben wir die Unterlagen (7)___.', options: ['abgab', 'abgeben', 'abgegeben'], answer: 'abgegeben', explanation: 'Avec l\'auxiliaire "haben", on utilise le Partizip II. Pour "abgeben", c\'est "abgegeben".' },
            { question: '...langsam (8)___ die Arbeit weniger.', options: ['hat', 'ist', 'wird'], answer: 'wird', explanation: 'Il s\'agit d\'un processus ("le travail diminue"), donc on utilise "wird" (devient).' },
            { question: 'Heute (9)___ glücklicherweise auch die letzte Besprechung ausgefallen.', options: ['hat', 'ist', 'war'], answer: 'ist', explanation: '"ausfallen" (être annulé) forme son Perfekt avec "sein", donc "ist ausgefallen".' },
            { question: 'Da bin ich sofort ins Freibad (10)___.', options: ['gegangen', 'gehen', 'ging'], answer: 'gegangen', explanation: 'Avec l\'auxiliaire "bin", on utilise le Partizip II. Pour "gehen", c\'est "gegangen".' },
        ]
    }
};
