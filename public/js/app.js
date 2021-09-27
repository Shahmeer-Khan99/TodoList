
$(".inside ul li").on("click" , function (){
    $(this).toggleClass("strike")
});

// $(".inside ul .Updates #del").on("click" , async function(){
//     var cache = $(this).closest("li");
//     alert(cache);
//     await cache.fadeOut(5000 , function(){
//         await cache.remove();
//     });
// })