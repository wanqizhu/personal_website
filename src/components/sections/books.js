import React, { useState, useEffect, useRef } from 'react';
import { Link, useStaticQuery, graphql } from 'gatsby';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import Img from 'gatsby-image';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { Icon } from '@components/icons';

const StyledBooksSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;

  h2 {
    font-size: clamp(24px, 5vw, var(--fz-heading));
  }

  .archive-link {
    font-family: var(--font-mono);
    font-size: var(--fz-sm);
    margin-top: 20px;
    &:after {
      bottom: 0.1em;
    }
  }

  .books-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    grid-gap: 15px;
    position: relative;
    margin-top: 50px;
    width: 100%; /* I don't understand why this line is needed,
                      but w/o it my grid collapsed into a single column.
                      Somewhere I introduced this bug compared to the original code. */

    @media (max-width: 1080px) {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
  }

  .more-button {
    ${({ theme }) => theme.mixins.button};
    margin: 80px auto 0;
  }
`;

const StyledPic = styled.div`
  position: relative;
  width: 70%;
  margin-bottom: 50px;

  p {
    text-align: right;
    margin-top: 30px;
  }

  .wrapper {
    ${({ theme }) => theme.mixins.boxShadow};
    display: block;
    position: relative;
    width: 100%;
    border-radius: var(--border-radius);
    background-color: var(--green);

    &:hover,
    &:focus {
      background: transparent;
      outline: 0;

      &:after {
        top: 15px;
        left: 15px;
      }

      .img {
        filter: none;
        mix-blend-mode: normal;
      }
    }

    .img {
      position: relative;
      border-radius: var(--border-radius);
      mix-blend-mode: multiply;
      filter: grayscale(100%) contrast(1);
      transition: var(--transition);
    }

    &:before,
    &:after {
      content: '';
      display: block;
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: var(--border-radius);
      transition: var(--transition);
    }

    &:before {
      top: 0;
      left: 0;
      background-color: var(--navy);
      mix-blend-mode: screen;
    }

    &:after {
      border: 2px solid var(--green);
      top: 20px;
      left: 20px;
      z-index: -1;
    }
  }
`;

const StyledBook = styled.div`
  cursor: default;
  transition: var(--transition);

  &:hover,
  &:focus {
    outline: 0;
    .book-inner {
      transform: translateY(-5px);
    }
  }

  .book-inner {
    ${({ theme }) => theme.mixins.boxShadow};
    ${({ theme }) => theme.mixins.flexBetween};
    flex-direction: column;
    align-items: flex-start;
    position: relative;
    height: 100%;
    padding: 2rem 1.75rem;
    border-radius: var(--border-radius);
    background-color: var(--light-navy);
    transition: var(--transition);
  }

  .book-top {
    ${({ theme }) => theme.mixins.flexBetween};
    margin-bottom: 35px;

    .bookicon {
      color: var(--green);
      svg {
        width: 40px;
        height: 40px;
      }
    }

    .book-links {
      display: flex;
      align-items: center;
      margin-right: -10px;
      color: var(--light-slate);

      a {
        ${({ theme }) => theme.mixins.flexCenter};
        padding: 5px 7px;

        &.external {
          svg {
            width: 22px;
            height: 22px;
            margin-top: -4px;
          }
        }

        svg {
          width: 20px;
          height: 20px;
        }
      }
    }
  }

  .book-title {
    margin: 0 0 10px;
    color: var(--lightest-slate);
    font-size: var(--fz-xxl);
  }

  .book-author {
    margin: 0 0 10px;
    color: var(--white);
    font-size: var(--fz-xl);
  }

  .book-description {
    color: var(--light-slate);
    font-size: 17px;

    a {
      ${({ theme }) => theme.mixins.inlineLink};
    }
  }

  .book-tag-list {
    display: flex;
    align-items: flex-end;
    flex-grow: 1;
    flex-wrap: wrap;
    padding: 0;
    margin: 20px 0 0 0;
    list-style: none;

    li {
      font-family: var(--font-mono);
      font-size: var(--fz-xxs);
      line-height: 1.75;

      &:not(:last-of-type) {
        margin-right: 15px;
      }
    }
  }
`;

const Books = () => {
  const data = useStaticQuery(graphql`
    query {
      books: allMarkdownRemark(
        filter: {
          fileAbsolutePath: { regex: "/books/" }
          frontmatter: { showInBooks: { ne: false } }
        }
        sort: { fields: [frontmatter___fav, frontmatter___date], order: [DESC, DESC] }
      ) {
        edges {
          node {
            frontmatter {
              fav
              title
              author
              external
              tags
            }
            html
          }
        }
      }
      photos: file(
        sourceInstanceName: { eq: "images" }
        relativePath: { eq: "photography/dream.jpg" }
      ) {
        childImageSharp {
          fluid(traceSVG: { color: "#64ffda" }) {
            ...GatsbyImageSharpFluid_withWebp_tracedSVG
          }
        }
      }
    }
  `);

  const [showMore, setShowMore] = useState(false);
  const revealTitle = useRef(null);
  const revealArchiveLink = useRef(null);
  const revealBooks = useRef([]);

  useEffect(() => {
    sr.reveal(revealTitle.current, srConfig());
    sr.reveal(revealArchiveLink.current, srConfig());
    revealBooks.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 100)));
  }, []);

  const GRID_LIMIT = 6;
  const books = data.books.edges.filter(({ node }) => node);
  const firstSix = books.slice(0, GRID_LIMIT);
  const booksToShow = showMore ? books : firstSix;

  return (
    <StyledBooksSection id="books">
      <h2 className="numbered-heading" ref={revealTitle}>
        Bits and Pieces
      </h2>

      <StyledPic
        onClick={() => window.open('https://www.flickr.com/photos/130336331@N08', '_blank')}>
        <div className="wrapper">
          <Img fluid={data.photos.childImageSharp.fluid} alt="Photo" className="img" />
        </div>
      </StyledPic>

      <p>A collection of books and other media that I've enjoyed lately or have inspired me.</p>

      <Link className="inline-link archive-link" to="/archive" ref={revealArchiveLink}>
        view the archive
      </Link>

      <TransitionGroup className="books-grid">
        {booksToShow &&
          booksToShow.map(({ node }, i) => {
            const { frontmatter, html } = node;
            const { title, author, external, tags } = frontmatter;

            return (
              <CSSTransition
                key={i}
                classNames="fadeup"
                timeout={i >= GRID_LIMIT ? (i - GRID_LIMIT) * 300 : 300}
                exit={false}>
                <StyledBook
                  key={i}
                  ref={el => (revealBooks.current[i] = el)}
                  tabIndex="0"
                  style={{
                    transitionDelay: `${i >= GRID_LIMIT ? (i - GRID_LIMIT) * 100 : 0}ms`,
                  }}>
                  <div className="book-inner">
                    <header>
                      <div className="book-top">
                        <div className="bookicon">
                          <Icon name="Book" />
                        </div>
                        <div className="book-links">
                          {external && (
                            <a href={external} aria-label="External Link" className="external">
                              <Icon name="External" />
                            </a>
                          )}
                        </div>
                      </div>

                      <h3 className="book-title">{title}</h3>
                      <h4 className="book-author">{author}</h4>

                      <div
                        className="book-description"
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    </header>

                    <footer>
                      {tags && (
                        <ul className="book-tag-list">
                          {tags.map((tag, i) => (
                            <li key={i}>{tag}</li>
                          ))}
                        </ul>
                      )}
                    </footer>
                  </div>
                </StyledBook>
              </CSSTransition>
            );
          })}
      </TransitionGroup>

      <button className="more-button" onClick={() => setShowMore(!showMore)}>
        Show {showMore ? 'Less' : 'More'}
      </button>
    </StyledBooksSection>
  );
};

export default Books;
