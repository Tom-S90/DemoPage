//Page selection setting
function goToPage(pageNumber) {
    const container = document.getElementById('container');
        switch(pageNumber)
        {
            case 1:
                container.style.transform = 'translateX(0)';
                break;
            case 2:
                container.style.transform = 'translateX(-100vw)';
                break;
            case 3:
                container.style.transform = 'translateX(-200vw)';
                break;
            case 4:
                container.style.transform = 'translateX(-300vw)';
                break;
            case 5:
                container.style.transform = 'translateX(-400vw)';
                break;
            case 6:
                container.style.transform = 'translateX(-500vw)';
                break;
            case 7:
                container.style.transform = 'translateX(-600vw)';
                break;
            default:
                container.style.transform = 'translateX(0)';
              }
        }
//Continuous scrolling text
const word = "Lorem/ Ipsum/ ";
const repeatCount = 20;

const marqueeElement = document.getElementById("marquee");

// Fill the marquee with repeated words and duplicate it for a seamless effect
const text = word.repeat(repeatCount);
marqueeElement.innerHTML = text + text; // Duplicate content for continuous flow
