const index = () => {
    let foo = { q: 1, w: 2 };
    let bar = { e: 3, r: 4 };
    let baz = { t: 5, y: 6 };
    console.log(Object.assign(foo, bar, baz));
}

export default index;