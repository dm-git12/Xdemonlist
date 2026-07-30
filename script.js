const API =
    "https://pointercrate.com/api/v2/demons/listed/?limit=100";


const state = {

    levels: [],

    filtered: []

};


const levelList =
    document.getElementById("levelList");


const loading =
    document.getElementById("loading");


const search =
    document.getElementById("search");


const range =
    document.getElementById("range");


const themeButton =
    document.getElementById("themeButton");


const modal =
    document.getElementById("modal");


const closeModal =
    document.getElementById("closeModal");


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/[&<>"']/g, character => {

            return {

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            }[character];

        });

}


function creatorNames(creators) {

    if (!Array.isArray(creators)) {

        return "Unknown";

    }


    return creators

        .map(creator => {

            if (typeof creator === "string") {

                return creator;

            }


            return creator.name || "";

        })

        .filter(Boolean)

        .join(", ");

}


function verifierName(verifier) {

    if (!verifier) {

        return "Unknown";

    }


    if (typeof verifier === "string") {

        return verifier;

    }


    return verifier.name || "Unknown";

}


function youtubeThumbnail(video) {

    if (!video) {

        return "";

    }


    const match =
        video.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]+)/
        );


    if (!match) {

        return "";

    }


    return `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg`;

}


function getThumbnail(level) {

    if (level.thumbnail) {

        return level.thumbnail;

    }


    return youtubeThumbnail(
        level.video
    );

}


function normalise(data) {

    return data

        .map(level => {

            return {

                id:
                    level.id,

                position:
                    level.position,

                name:
                    level.name,

                creators:
                    creatorNames(
                        level.creators
                    ),

                verifier:
                    verifierName(
                        level.verifier
                    ),

                publisher:
                    typeof level.publisher === "string"

                        ? level.publisher

                        : level.publisher?.name || "",

                video:
                    level.video || "",

                thumbnail:
                    getThumbnail(level)

            };

        })

        .sort(
            (a,b) =>
                a.position - b.position
        );

}


function render() {

    const query =
        search.value
            .trim()
            .toLowerCase();


    const maximum =
        Number(range.value);


    state.filtered =
        state.levels.filter(level => {

            const searchable = `

                ${level.name}

                ${level.creators}

                ${level.verifier}

            `.toLowerCase();


            return (

                level.position <= maximum &&

                searchable.includes(query)

            );

        });


    levelList.innerHTML =
        state.filtered.map(level => {


            let special = "";


            if (level.position === 1) {

                special = "top1";

            }

            else if (level.position === 2) {

                special = "top2";

            }

            else if (level.position === 3) {

                special = "top3";

            }


            let thumbnail = "";


            if (level.thumbnail) {

                thumbnail = `

                    <img

                        class="level-thumbnail"

                        src="${escapeHTML(level.thumbnail)}"

                        alt="${escapeHTML(level.name)}"

                        loading="lazy"

                        onerror="this.style.display='none'"

                    >

                `;

            }


            return `

                <article
                    class="level-card ${special}"
                >


                    <div class="rank">

                        #${level.position}

                    </div>


                    ${thumbnail}


                    <div class="level-info">


                        <h3>

                            ${escapeHTML(
                                level.name
                            )}

                        </h3>


                        <p>

                            by

                            ${escapeHTML(
                                level.creators
                            )}

                        </p>


                        <div class="tags">


                            <span class="tag">

                                DEMON

                            </span>


                            ${
                                level.publisher

                                ?

                                `

                                <span class="tag">

                                    ${escapeHTML(
                                        level.publisher
                                    )}

                                </span>

                                `

                                :

                                ""

                            }


                        </div>


                        <button

                            class="details-button"

                            onclick="openLevel(${level.id})"

                        >

                            View Level

                        </button>


                    </div>


                    <div class="verifier">


                        <span>

                            VERIFIED BY

                        </span>


                        <strong>

                            ${escapeHTML(
                                level.verifier
                            )}

                        </strong>


                    </div>


                </article>

            `;

        })

        .join("");


    loading.textContent =
        `${state.filtered.length} levels displayed`;

}


async function loadList() {

    try {

        const response =
            await fetch(API);


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        const raw =
            Array.isArray(data)
                ? data
                : data.data || [];


        state.levels =
            normalise(raw)
                .slice(0,100);


        if (state.levels.length > 0) {

            const top =
                state.levels[0];


            document.getElementById(
                "heroLevel"
            ).textContent =
                top.name;


            document.getElementById(
                "heroCreator"
            ).textContent =
                `by ${top.creators}`;

        }


        render();


    }

    catch(error) {

        console.error(error);


        loading.innerHTML = `

            <strong>
                Unable to load the Demonlist.
            </strong>

            <br><br>

            Make sure you are running this
            project through VS Code Live Server.

        `;

    }

}


function openLevel(id) {

    const level =
        state.levels.find(
            item =>
                item.id === id
        );


    if (!level) {

        return;

    }


    document.getElementById(
        "modalImage"
    ).src =
        level.thumbnail || "";


    document.getElementById(
        "modalRank"
    ).textContent =
        `#${level.position}`;


    document.getElementById(
        "modalTitle"
    ).textContent =
        level.name;


    document.getElementById(
        "modalCreator"
    ).textContent =
        `Created by ${level.creators}`;


    document.getElementById(
        "modalVerifier"
    ).textContent =
        level.verifier;


    document.getElementById(
        "modalPosition"
    ).textContent =
        `#${level.position}`;


    const video =
        document.getElementById(
            "modalVideo"
        );


    if (level.video) {

        video.href =
            level.video;

        video.style.display =
            "inline-flex";

    }

    else {

        video.style.display =
            "none";

    }


    modal.classList.add(
        "active"
    );

}


closeModal.addEventListener(
    "click",
    () => {

        modal.classList.remove(
            "active"
        );

    }
);


document
    .querySelector(".modal-background")
    .addEventListener(
        "click",
        () => {

            modal.classList.remove(
                "active"
            );

        }
    );


search.addEventListener(
    "input",
    render
);


range.addEventListener(
    "change",
    render
);


themeButton.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "light"
        );


        themeButton.textContent =
            document.body.classList.contains(
                "light"
            )

            ? "☀"

            : "☾";

    }
);


loadList();